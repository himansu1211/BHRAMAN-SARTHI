import { CONNECTION_BUFFERS } from "../constants";
import { TravelSegment } from "../types";

export type TransferType =
  | "airport_airport"
  | "station_station"
  | "bus_bus"
  | "station_bus"
  | "bus_station"
  | "airport_station"
  | "station_airport"
  | "airport_bus"
  | "bus_airport";

export interface ConnectionValidationResult {
  isValid: boolean;
  requiredTransferMinutes: number;
  actualTransferMinutes: number;
  transferType: TransferType;
  reason?: string;
}

/**
 * Returns required transfer duration in minutes between two transit nodes
 */
export function getRequiredTransferBuffer(
  fromSegment: TravelSegment,
  toSegment: TravelSegment
): { requiredMinutes: number; transferType: TransferType } {
  const fromType = fromSegment.type;
  const toType = toSegment.type;

  if (fromType === "flight" && toType === "flight") {
    return {
      requiredMinutes: CONNECTION_BUFFERS.AIRPORT_TO_AIRPORT,
      transferType: "airport_airport",
    };
  }

  if (fromType === "train" && toType === "train") {
    return {
      requiredMinutes: CONNECTION_BUFFERS.STATION_TO_STATION,
      transferType: "station_station",
    };
  }

  if (fromType === "bus" && toType === "bus") {
    return {
      requiredMinutes: CONNECTION_BUFFERS.BUS_TO_BUS,
      transferType: "bus_bus",
    };
  }

  if (fromType === "train" && toType === "bus") {
    return {
      requiredMinutes: CONNECTION_BUFFERS.STATION_TO_BUS,
      transferType: "station_bus",
    };
  }

  if (fromType === "bus" && toType === "train") {
    return {
      requiredMinutes: CONNECTION_BUFFERS.BUS_TO_STATION,
      transferType: "bus_station",
    };
  }

  if (fromType === "flight" && toType === "train") {
    return {
      requiredMinutes: CONNECTION_BUFFERS.AIRPORT_TO_STATION,
      transferType: "airport_station",
    };
  }

  if (fromType === "train" && toType === "flight") {
    return {
      requiredMinutes: CONNECTION_BUFFERS.STATION_TO_AIRPORT,
      transferType: "station_airport",
    };
  }

  if (fromType === "flight" && toType === "bus") {
    return {
      requiredMinutes: CONNECTION_BUFFERS.AIRPORT_TO_BUS,
      transferType: "airport_bus",
    };
  }

  // bus to flight
  return {
    requiredMinutes: CONNECTION_BUFFERS.BUS_TO_AIRPORT,
    transferType: "bus_airport",
  };
}

/**
 * Validates whether connection between two consecutive segments is viable
 */
export function validateConnection(
  firstSegment: TravelSegment,
  secondSegment: TravelSegment
): ConnectionValidationResult {
  const arrival = new Date(firstSegment.arrivalTime).getTime();
  const departure = new Date(secondSegment.departureTime).getTime();

  const actualTransferMinutes = Math.floor((departure - arrival) / (60 * 1000));
  const { requiredMinutes, transferType } = getRequiredTransferBuffer(firstSegment, secondSegment);

  if (actualTransferMinutes < 0) {
    return {
      isValid: false,
      requiredTransferMinutes: requiredMinutes,
      actualTransferMinutes,
      transferType,
      reason: "Connecting departure occurs before previous segment arrives.",
    };
  }

  if (actualTransferMinutes < requiredMinutes) {
    return {
      isValid: false,
      requiredTransferMinutes: requiredMinutes,
      actualTransferMinutes,
      transferType,
      reason: `Transfer buffer too tight: only ${actualTransferMinutes} mins available, minimum required is ${requiredMinutes} mins.`,
    };
  }

  return {
    isValid: true,
    requiredTransferMinutes: requiredMinutes,
    actualTransferMinutes,
    transferType,
  };
}
