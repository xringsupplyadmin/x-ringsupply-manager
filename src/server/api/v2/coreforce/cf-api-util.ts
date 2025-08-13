import { urlJoinP } from "url-join-ts";
import { z } from "zod/v4";
import { env } from "~/env";
import { CF_API_HEADER } from "~/lib/server_utils";

export class CfApiError extends Error {
  method: string;

  constructor(method: string, message: string, options?: ErrorOptions) {
    super(`[CF-API] Error during ${method}: ${message}`, options);
    this.name = "CfApiError";
    this.method = method;
    this.message = message;
  }
}

/**
 * Remove all undefined, null, or blank values from an object
 *
 * *Mutates in place*
 *
 * @param obj The object to filter
 * @param allowNull Do not filter null
 * @param allowEmpty Do not filter empty string
 * @return The same object for convenience
 */
export function filterUndefined<T extends object>(
  obj: T,
  allowNull = false,
  allowEmpty = false,
) {
  // Filter out empty values
  for (const key in obj) {
    // type stuff
    const index = key as keyof typeof obj;
    if (
      obj[index] === undefined ||
      (!allowEmpty && obj[index] === "") ||
      (!allowNull && obj[index] === null)
    ) {
      delete obj[index];
    }
  }

  return obj; // for convenience
}

/**
 * Get a query string for an array of numbers
 * @param array
 */
export function getArrayQueryString(array?: number[]) {
  return array ? array.join(",") : undefined;
}

const ApiResponse = z.union([
  z.object({ result: z.literal("OK") }),
  z.object({
    result: z.literal("ERROR"),
    error_message: z.string(),
  }),
]);
type ApiResponse = z.infer<typeof ApiResponse>;

export async function makeApiRequest(
  method: string,
  params?: object,
  init?: RequestInit,
) {
  const url = urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["api.php"], {
    method: method,
    ...(params ? filterUndefined(params, true, true) : {}),
  });
  console.debug("Making API request to", url);
  return {
    method: method,
    response: await fetch(url, {
      ...init,
      headers: {
        ...CF_API_HEADER,
        ...init?.headers,
      },
    }),
  };
}

/**
 * Parse the response from the CF API into the expected data
 *
 * @param method The API method
 * @param response The response from the CF API
 * @param parser The Zod parser to extract the data
 * @returns The parsed data
 * @throws {Error} If the response is not valid or an API error occurred
 */
export async function parseApiResponse<Shape, Parser extends z.ZodType<Shape>>(
  { method, response }: { method: string; response: Response },
  parser: Parser,
) {
  if (response.status !== 200) {
    throw new CfApiError("fetch", `code ${response.status}`);
  }

  const json = await response.json();

  const { success, data, error } = ApiResponse.safeParse(json);

  if (success) {
    if (data.result !== "OK") {
      throw new CfApiError(method, data.error_message);
    }
    const responseData = parser.safeParse(json);
    if (responseData.success) {
      return responseData.data;
    } else {
      throw new CfApiError(method, responseData.error.message);
    }
  } else {
    throw new CfApiError(method, `Malformatted API Response: ${error.message}`);
  }
}
