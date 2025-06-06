import type {
  EventBuilderMetadata,
  EventData,
  EventRawMetadata,
  MetricData,
  ProfileData,
} from "~/server/api/v2/types/klaviyo";
import { v4 as uuidv4 } from "uuid";

/**
 * Helper function to convert between simple metadata and klaviyo event metadata
 *
 * Automatically fills `time` and `uniqueId` if not provided
 *
 * @param metadata Simple metadata
 * @returns
 */
function buildEventMetadata(metadata: EventBuilderMetadata): EventRawMetadata {
  const metricMeta: MetricData = {
    data: {
      type: "metric",
      attributes: {
        name: metadata.metricID,
      },
    },
  };
  const profileMeta: ProfileData = {
    data: {
      type: "profile",
      attributes: {
        email: metadata.profileEmail,
      },
    },
  };

  const builtMeta: EventRawMetadata = {
    uniqueId: metadata.uniqueId ?? uuidv4(),
    time: metadata.time ?? new Date(),
    metric: metricMeta,
    profile: profileMeta,
    value: metadata.value,
    valueCurrency: metadata.valueCurrency,
  };

  return builtMeta;
}

export function buildEvent<T extends Record<string, unknown>>(event: {
  data: T;
  metadata: EventBuilderMetadata;
}): EventData<T> {
  return {
    data: {
      type: "event",
      attributes: {
        ...buildEventMetadata(event.metadata),
        properties: event.data,
      },
    },
  };
}
