import { AppError } from "@/lib/errors";
import type { TrainProvider, TrainSearchParams, TravelSegment } from "@/lib/types/travel";

export class RealTrainProvider implements TrainProvider {
  async searchTrains(_params: TrainSearchParams): Promise<TravelSegment[]> {
    if (!process.env.TRAIN_API_KEY) {
      throw new AppError(
        "missing_api_key",
        "Train API is not configured.",
        503,
      );
    }

    throw new AppError(
      "provider_unavailable",
      "Live train search is not wired yet. Demo data is used instead.",
      503,
    );
  }
}
