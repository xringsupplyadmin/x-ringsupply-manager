import axios from "axios";
import {
  ApiKeySession,
  CatalogsApi,
  EventsApi,
  FilterBuilder,
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
import { z } from "zod";

axios.interceptors.response.use(undefined, (error) =>
  Promise.reject(new KlaviyoError("test", error)),
);
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

const KlaviyoErrorData = z.object({
  errors: z.array(
    z.object({
      id: z.string(),
      status: z.number(),
      code: z.string(),
      title: z.string(),
      detail: z.string(),
      source: z.record(z.any()),
    }),
  ),
});

/** Magic error wrapper for Klaviyo `AxiosError`s */
class KlaviyoError extends Error {
  constructor(message: string, error: unknown) {
    let errorMsg: string;
    if (axios.isAxiosError(error)) {
      try {
        const { errors } = KlaviyoErrorData.parse(error.response?.data);
        if (errors.length === 1) {
          const error = errors[0]!;
          errorMsg = `${error.title} (code ${error.status}): ${error.detail}`;
        } else if (errors.length > 1) {
          const allErrors = errors.map((e, i) => `E${i + 1}: ${e.title}`);
          errorMsg = `Multiple Errors (check console for details). ${allErrors.join("; ")}`;
        } else {
          throw new Error("No error data"); // let the fallback handle it
        }
      } catch {
        errorMsg = `${error.response?.statusText ?? error.message} (code ${error.status ?? "unknown"})`;
      }
    } else if (error instanceof Error) {
      errorMsg = error.message;
    } else {
      errorMsg = `${error}`;
    }
    super(`KlaviyoError: ${message}! ${errorMsg}`, {
      cause: error,
    });
  }
}

type ApiResponse<Datatype> = {
  response: { status: number; statusText: string };
  body: Datatype;
};

type EmptyApiResponse<Datatype> = {
  response: { status: number; statusText: string };
  body?: Datatype;
};

/**
 * Unwrap the internals of the Klaviyo API response
 *
 * @param response The response from the API
 * @param allowedStatusCodes The status codes that are considered successful (default common HTTP 2xx)
 * @returns The body of the response
 * @throws If the response status is not in the allowed status codes
 */
function unwrapResponse<Datatype>(
  response: ApiResponse<Datatype>,
  allowedStatusCodes?: number[],
): Datatype;
function unwrapResponse<Datatype>(
  response: EmptyApiResponse<Datatype>,
  allowedStatusCodes?: number[],
): Datatype | undefined;
function unwrapResponse<Datatype>(
  response: ApiResponse<Datatype> | EmptyApiResponse<Datatype>,
  allowedStatusCodes = [200, 201, 204],
) {
  if (!allowedStatusCodes.includes(response.response.status)) {
    throw new Error(
      `${response.response.statusText} (${response.response.status})`,
    );
  }

  return response.body;
}

export async function request<Datatype>(
  executor: () => Promise<ApiResponse<Datatype>>,
): Promise<Datatype>;
export async function request<Datatype>(
  executor: () => Promise<EmptyApiResponse<Datatype>>,
): Promise<Datatype | undefined>;
export async function request<Datatype>(
  executor: () => Promise<ApiResponse<Datatype> | EmptyApiResponse<Datatype>>,
) {
  try {
    return unwrapResponse(await executor());
  } catch (e) {
    throw new KlaviyoError("API Request Failed", e);
  }
}

type PagedApiResponse<Datatype> = ApiResponse<{
  data: Array<Datatype>;
  links?: CollectionLinks;
}>;

/**
 * Fetch all pages of a multi-page Klaviyo API response
 *
 * @param executor A function accepting the progressively incrementing cursor and returning the next page
 * @returns The concatenanted results of all pages
 * @throws If any page fails to load
 */
export async function allPages<Datatype>(
  executor: (cursor?: string) => Promise<PagedApiResponse<Datatype>>,
) {
  let cursor: string | undefined;
  let data: Datatype[] = [] as Datatype[];

  while (true) {
    try {
      const body = unwrapResponse(await executor(cursor));

      data = [...data, ...body.data];
      cursor = body.links?.next;
    } catch (e) {
      throw new KlaviyoError("Failed to fetch data", e);
    }

    if (!cursor) break;
  }

  return data;
}

export const klaviyo = {
  events,
  catalog,
  request,
  filter: () => new FilterBuilder(),
  getId: (cfId: number) => `$custom:::$default:::${cfId}`,
};
