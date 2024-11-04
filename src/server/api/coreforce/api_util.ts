import { urlJoinP } from "url-join-ts";
import { z, type ZodObject, type ZodRawShape } from "zod";
import { env } from "~/env";
import { CF_API_HEADER } from "~/lib/server_utils";

const ApiResponse = z
  .object({
    result: z.literal("OK"),
  })
  .or(z.object({ result: z.literal("ERROR"), error_message: z.string() }));

export async function makeApiRequest(
  action: string,
  params?: object,
  init?: RequestInit,
) {
  const url = urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["api.php"], {
    method: action,
    ...params,
  });
  console.debug(url);
  return await fetch(url, {
    ...init,
    headers: {
      ...CF_API_HEADER,
      ...init?.headers,
    },
  });
}

/**
 * Parse the response from the CF API into the expected data
 *
 * @param response The response from the CF API
 * @param parser The Zod parser to extract the data
 * @returns The parsed data
 * @throws {Error} If the response is not valid or an API error occurred
 */

export async function parseApiResponse<
  Shape extends ZodRawShape,
  Parser extends ZodObject<Shape>,
>(response: Response, parser: Parser) {
  const json = await response.json();

  const apiResponse = ApiResponse.safeParse(json);

  if (apiResponse.success) {
    if (apiResponse.data.result !== "OK") {
      throw new Error("API Error: " + apiResponse.data.error_message);
    }
    return parser.parse(json) as z.infer<Parser>;
  } else {
    throw new Error("Invalid API Response: " + apiResponse.error.message);
  }
}

export function getArrayQueryString(array?: number[]) {
  return array ? array.join(",") : undefined;
}
