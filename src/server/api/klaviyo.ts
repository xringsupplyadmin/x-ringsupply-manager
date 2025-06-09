import {
  ApiKeySession,
  CatalogsApi,
  type CollectionLinks,
  EventsApi,
  FilterBuilder,
} from "klaviyo-api";
import { env } from "~/env";
import { KlaviyoError } from "~/server/api/v2/types/klaviyo";

const klaviyoSession = new ApiKeySession(env.KLAVIYO_API_KEY);
const events = new EventsApi(klaviyoSession);
const catalog = new CatalogsApi(klaviyoSession);

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
 * @throws Error If the response status is not in the allowed status codes
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

/**
 * Wrapper for Klaviyo API calls
 * Automatically unwraps response and checks status codes
 * Wraps internal AxiosErrors
 * @param executor The function that will execute the API call
 * @throws KlaviyoError If the API call fails or returns a bad response
 */
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
  let cursor: string | undefined = undefined;
  let data: Datatype[] = [] as Datatype[];

  while (true) {
    try {
      const body = await request(() => executor(cursor));

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
