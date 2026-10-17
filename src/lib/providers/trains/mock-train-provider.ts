import { TRAIN_TEMPLATES } from "@/lib/providers/catalog";
import { instantiateTemplate, sanitizeSegment } from "@/lib/providers/instantiate";
import type { TrainProvider, TrainSearchParams, TravelSegment } from "@/lib/types/travel";

export class MockTrainProvider implements TrainProvider {
  async searchTrains(params: TrainSearchParams): Promise<TravelSegment[]> {
    return TRAIN_TEMPLATES.map((template) =>
      instantiateTemplate(template, params.date),
    )
      .map(sanitizeSegment)
      .filter((segment): segment is TravelSegment => segment !== null)
      .filter((segment) => segment.from.cityId === params.originCity)
      .filter((segment) =>
        params.destinationCity
          ? segment.to.cityId === params.destinationCity
          : true,
      );
  }
}
