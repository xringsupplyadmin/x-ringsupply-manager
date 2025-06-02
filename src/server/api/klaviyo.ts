import {
  ApiKeySession,
  CatalogsApi,
  EventsApi,
  type CollectionLinks,
} from "klaviyo-api";
import { env } from "~/env";
import type {
  EventBuilderMetadata,
  EventData,
  EventRawMetadata,
  MetricData,
  ProfileData,
} from "./v2/types/klaviyo";

import { v4 as uuidv4 } from "uuid";

const klaviyoSession = new ApiKeySession(env.KLAVIYO_API_KEY);
const events = new EventsApi(klaviyoSession);
const catalog = new CatalogsApi(klaviyoSession);
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

type PagedApiResponse<Datatype> = {
  response: { status: number; statusText: string };
  body: {
    data: Array<Datatype>;
    links?: CollectionLinks;
  };
};

export async function allPages<Datatype>(
  executor: (cursor?: string) => Promise<PagedApiResponse<Datatype>>,
) {
  let cursor: string | undefined;
  let data: Datatype[] = [] as Datatype[];

  while (true) {
    try {
      const { response, body } = await executor(cursor);

      if (response.status !== 200) {
        throw new Error(
          `Failed to fetch data (${response.status}): ${response.statusText}`,
        );
      }

      data = [...data, ...body.data];
      cursor = body.links?.next;
    } catch (e) {
      throw new Error(`Failed to fetch data: ${e}`);
    }

    if (!cursor) break;
  }

  return data;
}

export const klaviyo = {
  events,
  catalog,
};
