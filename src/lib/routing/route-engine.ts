import { INDIAN_CITIES } from "../constants";
import { getTrainProvider } from "../providers/train-provider";
import { getBusProvider } from "../providers/bus-provider";
import {
  CityHub,
  InterchangeTransit,
  RouteEndpointTransfer,
  SearchRequest,
  SearchResponse,
  TravelRoute,
  TravelSegment,
} from "../types";
import { validateConnection } from "./connection-validator";
import { calculateDeadlineBufferMinutes } from "./deadline-calculator";
import {
  computeRouteScore,
  generateDeterministicExplanation,
} from "./route-score";

import { resolveCityHub } from "../data-lookup";
import { DatasetTrainProvider } from "../providers/dataset-train-provider";
import { DatasetFlightProvider } from "../providers/dataset-flight-provider";
import { getIntraCityInterchange, calculateRouteTotalDistance, getInterCityDistance } from "../distance-service";
import { stationGroupFor } from "../station-groups";

function getCityHub(idOrCode: string): CityHub {
  return resolveCityHub(idOrCode);
}

function resolveInterchange(
  cityId: string,
  fromCode: string,
  toCode: string
): InterchangeTransit | undefined {
  if (fromCode === toCode) return undefined;
  return getIntraCityInterchange(cityId, fromCode, toCode);
}

const dsTrainProvider = new DatasetTrainProvider();
const dsFlightProvider = new DatasetFlightProvider();
const HUB_BY_NODE_CACHE = new Map<string, CityHub | null>();

function hubForNode(code: string): CityHub | undefined {
  const upper = code.toUpperCase();
  if (HUB_BY_NODE_CACHE.has(upper)) return HUB_BY_NODE_CACHE.get(upper) ?? undefined;
  const exact = INDIAN_CITIES.find((c) => [c.airportCode, c.stationCode, c.busTerminalCode].includes(upper));
  if (exact) {
    HUB_BY_NODE_CACHE.set(upper, exact);
    return exact;
  }
  const group = stationGroupFor(upper);
  if (!group) {
    const resolved = resolveCityHub(upper);
    const hub = resolved.stationCode || resolved.airportCode || resolved.busTerminalCode ? resolved : undefined;
    HUB_BY_NODE_CACHE.set(upper, hub ?? null);
    return hub;
  }
  const groupCity = group.city.toLowerCase();
  const aliases: Record<string, string> = { bengaluru: "BLR", bangalore: "BLR", delhi: "DEL", mumbai: "BOM", kolkata: "CCU", hyderabad: "HYD", chennai: "MAA", kochi: "COK", ahmedabad: "AMD", pune: "PNQ", lucknow: "LKO", patna: "PAT", jaipur: "JAI", varanasi: "VNS", kanpur: "CNB", prayagraj: "IXD", agra: "AGR", surat: "STV", visakhapatnam: "VTZ", thiruvananthapuram: "TRV", guwahati: "GAU", bhopal: "BHO", ranchi: "IXR", nagpur: "NAG", raipur: "RPR", bhubaneswar: "BBI" };
  const groupedCity = INDIAN_CITIES.find((city) => city.id === aliases[groupCity] || city.name.toLowerCase() === groupCity);
  if (groupedCity) {
    HUB_BY_NODE_CACHE.set(upper, groupedCity);
    return groupedCity;
  }
  const resolved = resolveCityHub(upper);
  const hub = resolved.stationCode || resolved.airportCode || resolved.busTerminalCode ? resolved : undefined;
  HUB_BY_NODE_CACHE.set(upper, hub ?? null);
  return hub;
}

export async function searchRoutes(request: SearchRequest): Promise<SearchResponse> {
  const originHub = getCityHub(request.origin);
  const destHub = getCityHub(request.destination);

  if (!originHub || !destHub) {
    throw new Error("Invalid origin or destination transit hub specified.");
  }

  if (originHub.id.toUpperCase() === destHub.id.toUpperCase()) {
    throw new Error("Origin and destination cannot be identical transit hubs.");
  }

  const trainProvider = getTrainProvider();
  const busProvider = getBusProvider();

  // Retrieve candidate segments across Flights, Trains, and Buses + Dataset Snapshot Providers
  const [allTrains, allBuses, dsTrains, corridorFlightSearch] = await Promise.all([
    trainProvider.getAllAvailableTrains(
      request.date,
      [originHub.stationCode, ...(originHub.nearbyStationCodes ?? [])].filter(Boolean),
      [destHub.stationCode, ...(destHub.nearbyStationCodes ?? [])].filter(Boolean),
    ),
    busProvider.getAllAvailableBuses(request.date),
    dsTrainProvider.searchTrains({ originCode: originHub.stationCode, destinationCode: destHub.stationCode, date: request.date }),
    dsFlightProvider.searchCorridorFlights(
      { airportCode: originHub.airportCode, latitude: originHub.latitude, longitude: originHub.longitude },
      { airportCode: destHub.airportCode, latitude: destHub.latitude, longitude: destHub.longitude },
      request.date,
    ),
  ]);

  const rawSegments = [...corridorFlightSearch.segments, ...dsTrains, ...allTrains, ...allBuses];
  const uniqueSegmentMap = new Map<string, TravelSegment>();
  for (const seg of rawSegments) {
    const key = `${seg.type}_${seg.operatorCode}_${seg.segmentNumber}_${seg.fromCode}_${seg.toCode}_${seg.departureTime.slice(0, 16)}`;
    if (!uniqueSegmentMap.has(key)) {
      uniqueSegmentMap.set(key, seg);
    } else {
      const existing = uniqueSegmentMap.get(key)!;
      // If candidate has rich verified flightDetails and existing does not, upgrade it
      if (!existing.flightDetails && seg.flightDetails) {
        uniqueSegmentMap.set(key, seg);
      }
    }
  }
  const allSegments = Array.from(uniqueSegmentMap.values());

  const originGroup = stationGroupFor(originHub.stationCode);
  const destGroup = stationGroupFor(destHub.stationCode);
  const originCodes = new Set([
    originHub.airportCode,
    originHub.stationCode,
    originHub.busTerminalCode,
    ...(originHub.nearbyStationCodes ?? []),
    ...corridorFlightSearch.originAirportCodes,
    ...(originGroup?.codes ?? []),
  ].filter(Boolean));
  const destCodes = new Set([
    destHub.airportCode,
    destHub.stationCode,
    destHub.busTerminalCode,
    ...(destHub.nearbyStationCodes ?? []),
    ...corridorFlightSearch.destinationAirportCodes,
    ...(destGroup?.codes ?? []),
  ].filter(Boolean));

  const candidateRoutes: TravelRoute[] = [];

  // 1. Direct segments (flight, train, or bus)
  const directSegments = allSegments.filter((seg) => {
    if (seg.departureTime.slice(0, 10) !== request.date) return false;
    if (!originCodes.has(seg.fromCode) || !destCodes.has(seg.toCode)) return false;
    return true;
  });

  for (const seg of directSegments) {
    const depTime = seg.departureTime;
    const arrTime = seg.arrivalTime;
    const duration = seg.durationMinutes;
    const price = seg.price;
    const deadlineBuffer = request.arriveBy ? calculateDeadlineBufferMinutes(arrTime, request.arriveBy) : null;

    const { overallScore, scoreBreakdown, confidence } = computeRouteScore(
      price,
      duration,
      [seg],
      [],
      deadlineBuffer,
      request.optimization
    );

    const isFeasible = deadlineBuffer == null || deadlineBuffer >= 0;
    const disqualificationReason = deadlineBuffer != null && !isFeasible
      ? `Arrives ${Math.abs(deadlineBuffer)}m after deadline`
      : undefined;

    const explanation = generateDeterministicExplanation({
      totalPrice: price,
      totalDurationMinutes: duration,
      transfers: 0,
      deadlineBufferMinutes: deadlineBuffer,
      estimatedArrivalConfidence: confidence,
    });

    candidateRoutes.push({
      id: `route_direct_${seg.id}`,
      segments: [seg],
      interchanges: [],
      totalPrice: price,
      totalDurationMinutes: duration,
      totalDistanceKm: calculateRouteTotalDistance([seg], []),
      transfers: 0,
      departureTime: depTime,
      arrivalTime: arrTime,
      deadlineBufferMinutes: deadlineBuffer,
      estimatedArrivalConfidence: confidence,
      overallScore,
      scoreBreakdown,
      explanation,
      isFeasible,
      disqualificationReason,
    });
  }

  // 2. 1-stop connecting journeys (Flight+Flight, Train+Train, Bus+Bus, Train+Flight, Flight+Train, Bus+Flight, Flight+Bus, Train+Bus, Bus+Train)
  const firstLegs = allSegments.filter(
    (seg) =>
      seg.departureTime.slice(0, 10) === request.date &&
      originCodes.has(seg.fromCode) &&
      !destCodes.has(seg.toCode)
  );

  const secondLegs = allSegments.filter(
    (seg) =>
      !originCodes.has(seg.fromCode) && destCodes.has(seg.toCode)
  );

  for (const leg1 of firstLegs) {
    for (const leg2 of secondLegs) {
      if (leg1.type === "train" && leg2.type === "train" && leg1.segmentNumber === leg2.segmentNumber) continue;
      // Find intermediate city hub
      const intermediateHub1 = hubForNode(leg1.toCode);
      const intermediateHub2 = hubForNode(leg2.fromCode);

      if (!intermediateHub1 || !intermediateHub2 || intermediateHub1.id !== intermediateHub2.id) {
        continue;
      }

      // Check connection viability
      const validation = validateConnection(leg1, leg2);
      const depTime = leg1.departureTime;
      const arrTime = leg2.arrivalTime;
      const totalDuration = Math.round(
        (new Date(arrTime).getTime() - new Date(depTime).getTime()) / (60 * 1000)
      );

      // Resolve intra-city interchange if nodes differ (e.g. airport to railway station)
      const interchange = resolveInterchange(
        intermediateHub1.id,
        leg1.toCode,
        leg2.fromCode
      );

      const interchangeCost = interchange ? interchange.estCost : 0;
      const totalPrice = leg1.price + leg2.price + interchangeCost;
      const deadlineBuffer = request.arriveBy ? calculateDeadlineBufferMinutes(arrTime, request.arriveBy) : null;

      const transferBuffers = [validation.actualTransferMinutes];

      const { overallScore, scoreBreakdown, confidence } = computeRouteScore(
        totalPrice,
        totalDuration,
        [leg1, leg2],
        transferBuffers,
        deadlineBuffer,
        request.optimization
      );

      const isFeasible = validation.isValid && (deadlineBuffer == null || deadlineBuffer >= 0);
      let disqualificationReason: string | undefined;

      if (!validation.isValid) {
        disqualificationReason = validation.reason;
      } else if (deadlineBuffer != null && deadlineBuffer < 0) {
        disqualificationReason = `Arrives ${Math.abs(deadlineBuffer)}m after deadline`;
      }

      const explanation = generateDeterministicExplanation({
        totalPrice,
        totalDurationMinutes: totalDuration,
        transfers: 1,
        deadlineBufferMinutes: deadlineBuffer,
        estimatedArrivalConfidence: confidence,
      });

      candidateRoutes.push({
        id: `route_transfer_${leg1.id}_${leg2.id}`,
        segments: [leg1, leg2],
        interchanges: interchange ? [interchange] : [],
        totalPrice,
        totalDurationMinutes: totalDuration,
        totalDistanceKm: calculateRouteTotalDistance([leg1, leg2], interchange ? [interchange] : []),
        transfers: 1,
        departureTime: depTime,
        arrivalTime: arrTime,
        deadlineBufferMinutes: deadlineBuffer,
        estimatedArrivalConfidence: confidence,
        overallScore,
        scoreBreakdown,
        explanation,
        isFeasible,
        disqualificationReason,
      });
    }
  }

  // 3. 2-stop connecting journeys (up to 2 transfers / 3 segments max).
  // Index by resolved city so multi-station cities can connect through any
  // station or airport, rather than only the city's representative code.
  const middleLegs = allSegments.filter(
    (seg) => !originCodes.has(seg.fromCode) && !destCodes.has(seg.toCode)
  );

  const legsByOriginCity = (segments: TravelSegment[]) => {
    const index = new Map<string, TravelSegment[]>();
    for (const segment of segments) {
      const city = hubForNode(segment.fromCode);
      if (!city) continue;
      const list = index.get(city.id) ?? [];
      list.push(segment);
      index.set(city.id, list);
    }
    return index;
  };
  const middleByOriginCity = legsByOriginCity(middleLegs);
  const finalByOriginCity = legsByOriginCity(secondLegs);

  for (const leg1 of firstLegs) {
    const hub1 = hubForNode(leg1.toCode);
    if (!hub1 || hub1.id === originHub.id || hub1.id === destHub.id) continue;

    for (const leg2 of middleByOriginCity.get(hub1.id) ?? []) {

      const hub2 = hubForNode(leg2.toCode);
      // Cycle pruning: hub2 must be distinct from originHub, hub1, and destHub
      if (!hub2 || hub2.id === originHub.id || hub2.id === destHub.id || hub2.id === hub1.id) {
        continue;
      }

      if (leg1.type === "train" && leg2.type === "train" && leg1.segmentNumber === leg2.segmentNumber) continue;

      const v1 = validateConnection(leg1, leg2);
      if (!v1.isValid) continue;

      for (const leg3 of finalByOriginCity.get(hub2.id) ?? []) {

        if (leg2.type === "train" && leg3.type === "train" && leg2.segmentNumber === leg3.segmentNumber) continue;

        const v2 = validateConnection(leg2, leg3);
        if (!v2.isValid) continue;

        const depTime = leg1.departureTime;
        const arrTime = leg3.arrivalTime;
        const totalDuration = Math.round(
          (new Date(arrTime).getTime() - new Date(depTime).getTime()) / (60 * 1000)
        );

        const ic1 = resolveInterchange(hub1.id, leg1.toCode, leg2.fromCode);
        const ic2 = resolveInterchange(hub2.id, leg2.toCode, leg3.fromCode);

        const icCost = (ic1 ? ic1.estCost : 0) + (ic2 ? ic2.estCost : 0);
        const totalPrice = leg1.price + leg2.price + leg3.price + icCost;
        const deadlineBuffer = request.arriveBy ? calculateDeadlineBufferMinutes(arrTime, request.arriveBy) : null;

        const transferBuffers = [v1.actualTransferMinutes, v2.actualTransferMinutes];

        const { overallScore, scoreBreakdown, confidence } = computeRouteScore(
          totalPrice,
          totalDuration,
          [leg1, leg2, leg3],
          transferBuffers,
          deadlineBuffer,
          request.optimization
        );

        const isFeasible = v1.isValid && v2.isValid && (deadlineBuffer == null || deadlineBuffer >= 0);
        const disqualificationReason = !isFeasible
          ? deadlineBuffer != null && deadlineBuffer < 0
            ? `Arrives ${Math.abs(deadlineBuffer)}m after deadline`
            : "Connection buffer insufficient"
          : undefined;

        const explanation = generateDeterministicExplanation({
          totalPrice,
          totalDurationMinutes: totalDuration,
          transfers: 2,
          deadlineBufferMinutes: deadlineBuffer,
          estimatedArrivalConfidence: confidence,
        });

        const interchangesList = [];
        if (ic1) interchangesList.push(ic1);
        if (ic2) interchangesList.push(ic2);

        candidateRoutes.push({
          id: `route_transfer2_${leg1.id}_${leg2.id}_${leg3.id}`,
          segments: [leg1, leg2, leg3],
          interchanges: interchangesList,
          totalPrice,
          totalDurationMinutes: totalDuration,
          totalDistanceKm: calculateRouteTotalDistance([leg1, leg2, leg3], interchangesList),
          transfers: 2,
          departureTime: depTime,
          arrivalTime: arrTime,
          deadlineBufferMinutes: deadlineBuffer,
          estimatedArrivalConfidence: confidence,
          overallScore,
          scoreBreakdown,
          explanation,
          isFeasible,
          disqualificationReason,
        });
      }
    }
  }

  // Airport-only legs for regional cities must include the real road access
  // between the selected rail station/city and the nearest served airport.
  for (const route of candidateRoutes) {
    const transfers: RouteEndpointTransfer[] = [];
    const first = route.segments[0];
    if (first?.type === "flight" && corridorFlightSearch.originAirportCodes.includes(first.fromCode) && originHub.stationCode && first.fromCode !== originHub.stationCode) {
      const access = resolveInterchange(originHub.id, originHub.stationCode, first.fromCode);
      if (access) transfers.push({ ...access, placement: "origin", description: `Road transfer from ${originHub.name} (${originHub.stationCode}) to airport ${first.fromCode}` });
    } else if (first && originHub.stationCode && first.fromCode !== originHub.stationCode && (originGroup?.codes.includes(first.fromCode) || originHub.nearbyStationCodes?.includes(first.fromCode) || first.fromCode === originHub.busTerminalCode)) {
      const access = resolveInterchange(originHub.id, originHub.stationCode, first.fromCode);
      if (access) transfers.push({ ...access, placement: "origin", description: `Road transfer from ${originHub.name} (${originHub.stationCode}) to departure terminal ${first.fromCode}` });
    }
    const last = route.segments[route.segments.length - 1];
    if (last?.type === "flight" && corridorFlightSearch.destinationAirportCodes.includes(last.toCode) && destHub.stationCode && last.toCode !== destHub.stationCode) {
      const access = resolveInterchange(destHub.id, last.toCode, destHub.stationCode);
      if (access) transfers.push({ ...access, placement: "destination", description: `Road transfer from airport ${last.toCode} to ${destHub.name} (${destHub.stationCode})` });
    } else if (last && destHub.stationCode && last.toCode !== destHub.stationCode && (destGroup?.codes.includes(last.toCode) || destHub.nearbyStationCodes?.includes(last.toCode) || last.toCode === destHub.busTerminalCode)) {
      const access = resolveInterchange(destHub.id, last.toCode, destHub.stationCode);
      if (access) transfers.push({ ...access, placement: "destination", description: `Road transfer from arrival terminal ${last.toCode} to ${destHub.name} (${destHub.stationCode})` });
    }
    if (transfers.length === 0) continue;

    route.endpointTransfers = transfers;
    route.totalPrice += transfers.reduce((sum, item) => sum + item.estCost, 0);
    route.totalDurationMinutes += transfers.reduce((sum, item) => sum + item.durationMinutes, 0);
    route.totalDistanceKm = Math.round(((route.totalDistanceKm ?? 0) + transfers.reduce((sum, item) => sum + (item.distanceKm ?? 0), 0)) * 10) / 10;
    route.transfers += transfers.length;
    if (transfers.some((item) => item.placement === "origin")) {
      const outbound = transfers.find((item) => item.placement === "origin")!;
      route.departureTime = new Date(new Date(first!.departureTime).getTime() - outbound.durationMinutes * 60_000).toISOString();
    }
    if (transfers.some((item) => item.placement === "destination")) {
      const inbound = transfers.find((item) => item.placement === "destination")!;
      route.arrivalTime = new Date(new Date(last!.arrivalTime).getTime() + inbound.durationMinutes * 60_000).toISOString();
    }
    route.deadlineBufferMinutes = request.arriveBy ? calculateDeadlineBufferMinutes(route.arrivalTime, request.arriveBy) : null;
    route.isFeasible = route.isFeasible && (route.deadlineBufferMinutes == null || route.deadlineBufferMinutes >= 0);
    if (!route.isFeasible && route.deadlineBufferMinutes != null && route.deadlineBufferMinutes < 0) route.disqualificationReason = `Arrives ${Math.abs(route.deadlineBufferMinutes)}m after deadline`;
    const scored = computeRouteScore(route.totalPrice, route.totalDurationMinutes, route.segments, [], route.deadlineBufferMinutes, request.optimization);
    route.overallScore = scored.overallScore;
    route.scoreBreakdown = scored.scoreBreakdown;
    route.estimatedArrivalConfidence = scored.confidence;
    route.explanation = generateDeterministicExplanation({ totalPrice: route.totalPrice, totalDurationMinutes: route.totalDurationMinutes, transfers: route.transfers, deadlineBufferMinutes: route.deadlineBufferMinutes, estimatedArrivalConfidence: scored.confidence });
  }

  // Penalize severe geographic backtracking for the balanced recommendation.
  // Keep alternatives visible; users can still select Fastest or inspect a hub route.
  const directDistance = getInterCityDistance(
    originHub.stationCode || originHub.airportCode,
    destHub.stationCode || destHub.airportCode,
    originHub.latitude && originHub.longitude ? { lat: originHub.latitude, lng: originHub.longitude } : undefined,
    destHub.latitude && destHub.longitude ? { lat: destHub.latitude, lng: destHub.longitude } : undefined
  ).flightKm;
  const reasonableDistanceLimit = Math.max(directDistance * 1.4, directDistance + 250);
  for (const route of candidateRoutes) {
    if (directDistance > 0 && route.totalDistanceKm && route.totalDistanceKm > reasonableDistanceLimit) {
      route.overallScore = Math.max(0, route.overallScore - Math.round((route.totalDistanceKm / directDistance - 1.4) * 24));
    }
  }

  // Filter budget if provided
  let filteredCandidates = candidateRoutes;
  if (request.budget && request.budget > 0) {
    filteredCandidates = candidateRoutes.filter((r) => r.totalPrice <= request.budget!);
  }

  // Sort according to optimization mode
  const sortFn = (a: TravelRoute, b: TravelRoute) => {
    const detour = (route: TravelRoute) => directDistance > 0 && route.totalDistanceKm != null && route.totalDistanceKm > reasonableDistanceLimit;
    if (detour(a) !== detour(b)) return detour(a) ? 1 : -1;
    if (request.optimization === "fastest") return a.totalDurationMinutes - b.totalDurationMinutes;
    if (request.optimization === "cheapest") return a.totalPrice - b.totalPrice;
    if (request.optimization === "highest_confidence") return b.estimatedArrivalConfidence - a.estimatedArrivalConfidence;
    return b.overallScore - a.overallScore;
  };

  const feasibleRoutes = filteredCandidates
    .filter((r) => r.isFeasible)
    .sort(sortFn);
  const reasonableRoutes = feasibleRoutes.filter((route) => !route.totalDistanceKm || route.totalDistanceKm <= reasonableDistanceLimit);
  // Keep every direct service visible, even if that means returning more than
  // 100 cards. Show reasonable mixed itineraries when available, capped at the
  // best 100 so severe backtracking cannot crowd out useful alternatives.
  const directServiceRoutes = feasibleRoutes.filter((route) => route.segments.length === 1);
  const allConnectingRoutes = feasibleRoutes.filter((route) => route.segments.length > 1);
  const reasonableConnectingRoutes = reasonableRoutes.filter((route) => route.segments.length > 1);
  const connectingRoutes = reasonableConnectingRoutes.length > 0 ? reasonableConnectingRoutes : allConnectingRoutes;
  const displayedConnectingRoutes = connectingRoutes.slice(0, 100);
  const displayedRoutes = [...directServiceRoutes, ...displayedConnectingRoutes].sort(sortFn);

  const highlightRoutes = reasonableRoutes.length > 0 ? reasonableRoutes : feasibleRoutes;

  const unfeasibleRoutes = filteredCandidates.filter((r) => !r.isFeasible);

  // Determine highlight category badges
  let bestBalance: TravelRoute | undefined;
  let fastest: TravelRoute | undefined;
  let cheapest: TravelRoute | undefined;
  let highestConfidence: TravelRoute | undefined;

  if (highlightRoutes.length > 0) {
    bestBalance = highlightRoutes[0];
    bestBalance.categoryBadge = "BEST BALANCE";

    fastest = [...highlightRoutes].sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes)[0];
    if (fastest && fastest.id !== bestBalance.id) {
      fastest.categoryBadge = "FASTEST";
    }

    cheapest = [...highlightRoutes].sort((a, b) => a.totalPrice - b.totalPrice)[0];
    if (cheapest && cheapest.id !== bestBalance.id && (!fastest || cheapest.id !== fastest.id)) {
      cheapest.categoryBadge = "CHEAPEST";
    }

    highestConfidence = [...highlightRoutes].sort(
      (a, b) => b.estimatedArrivalConfidence - a.estimatedArrivalConfidence
    )[0];
    if (
      highestConfidence &&
      highestConfidence.id !== bestBalance.id &&
      (!fastest || highestConfidence.id !== fastest.id) &&
      (!cheapest || highestConfidence.id !== cheapest.id)
    ) {
      highestConfidence.categoryBadge = "SAFEST";
    }

    // Festival / Rush Season Station Interchange Alternative Badge
    const festivalInterchange = feasibleRoutes.find(
      (r) =>
        r.transfers > 0 &&
        r.id !== bestBalance?.id &&
        r.id !== fastest?.id &&
        r.id !== cheapest?.id &&
        r.id !== highestConfidence?.id
    );
    if (festivalInterchange) {
      festivalInterchange.categoryBadge = "FESTIVAL RUSH INTERCHANGE";
    }

    // Nearest Airport Hub Intermodal Transfer Combo (Train/Bus to Airport + Flight)
    const airportCombo = feasibleRoutes.find(
      (r) =>
        r.transfers > 0 &&
        r.segments.some((s) => s.type === "flight") &&
        r.segments.some((s) => s.type === "train" || s.type === "bus") &&
        r.id !== bestBalance?.id &&
        r.id !== fastest?.id &&
        r.id !== cheapest?.id &&
        r.id !== highestConfidence?.id &&
        r.id !== festivalInterchange?.id
    );
    if (airportCombo) {
      airportCombo.categoryBadge = "NEAREST AIRPORT COMBO";
    }
  }

  return {
    search: request,
    summary: {
      bestBalance,
      fastest,
      cheapest,
      highestConfidence,
      totalRoutesFound: candidateRoutes.length,
      feasibleRoutesCount: feasibleRoutes.length,
      directRoutesCount: directServiceRoutes.length,
      connectingRoutesCount: displayedConnectingRoutes.length,
      dynamicPricingAdvisory:
        "Fares are estimates from stored schedules. Confirm the current fare and seat availability with the booking provider.",
      corridorCircumstancesAdvisory:
        "The rail graph includes major intermediate stations and airport access transfers. Weekday patterns are applied where supplied; all snapshot timetables need confirmation with the operator.",
    },
    routes: displayedRoutes,
    unfeasibleRoutes,
    isDemoData: !process.env.FLIGHT_API_KEY && !process.env.TRAIN_API_KEY && !process.env.BUS_API_KEY,
  };
}
