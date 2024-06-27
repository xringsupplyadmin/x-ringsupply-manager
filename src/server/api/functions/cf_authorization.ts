import { urlJoinP } from "url-join-ts";
import { z } from "zod";
import { env } from "~/env";
import {
  type ApiResponse,
  type StatusOnlyApiResponse,
  getConnectionKeyHeader,
  fetchSession,
} from "../common";

const LoginResponse = z.union([
  z.object({
    result: z.literal("ERROR"),
    error_message: z.string(),
  }),
  z.object({
    result: z.literal("OK"),
    user_id: z.number(),
    contact_id: z.number(),
    client_id: z.number(),
    session_identifier: z.string(),
  }),
]);

const SubmitTokenResponse = z.union([
  z.object({
    go_to_uri: z.string(),
    error_message: z.optional(z.string()),
  }),
  z.object({
    go_to_uri: z.optional(z.string()),
    error_message: z.string(),
  }),
]);

export async function authorize(): Promise<
  ApiResponse<{ token_required: boolean }>
> {
  const check = await fetchSession(
    urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["admin-menu"], {
      ajax: true,
    }),
    {
      method: "GET",
      cache: "no-cache",
      headers: getConnectionKeyHeader(),
      credentials: "include",
    },
  );

  try {
    // If JSON was returned, the user is not authorized
    await check.json(); // -> { "error_message": "..."}
    console.debug("Authorizing API user");
  } catch {
    // The response is the HTML of the admin menu, so the user is authorized
    console.debug("User is authorized");
    return {
      success: true,
      token_required: false,
    };
  }

  const credentials = new FormData();
  credentials.append("user_name", env.CF_USERNAME);
  credentials.append("password", env.CF_PASSWORD);

  const response = await fetchSession(
    urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["api.php"], {
      method: "login",
    }),
    {
      method: "POST",
      cache: "no-cache",
      body: credentials,
      headers: getConnectionKeyHeader(),
      credentials: "include",
    },
  );

  const status = LoginResponse.safeParse(await response.json());
  if (!status.success) {
    return {
      success: false,
      error: status.error.message,
    };
  }

  if (status.data.result === "OK") {
    return {
      success: true,
      token_required: false,
    };
  } else {
    return {
      success: false,
      error: status.data.error_message,
    };
  }
}

export async function submitToken(
  token: string,
): Promise<StatusOnlyApiResponse> {
  const authorization = new FormData();
  authorization.append("verification_code", token);
  authorization.append("computer_environment_private", "1");

  const response = await fetchSession(
    urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["authorizecomputer.php"], {
      ajax: true,
      url_action: "authorize_computer",
    }),
    {
      method: "POST",
      cache: "no-cache",
      body: authorization,
      headers: getConnectionKeyHeader(),
      credentials: "include",
    },
  );

  const status = SubmitTokenResponse.safeParse(await response.json());
  if (!status.success) {
    return {
      success: false,
      error: status.error.message,
    };
  }

  if (status.data.go_to_uri) {
    return {
      success: true,
    };
  } else {
    return {
      success: false,
      error: status.data.error_message ?? "Unknown error",
    };
  }
}
