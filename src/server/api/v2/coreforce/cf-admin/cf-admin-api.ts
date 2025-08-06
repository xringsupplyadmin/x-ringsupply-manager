import { CF_API_HEADER, fetchSession } from "~/lib/server_utils";
import { urlJoinP } from "url-join-ts";
import { env } from "~/env";
import { z } from "zod";

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

export async function checkAuthorized() {
  const check = await fetchSession(
    urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["admin-menu"], {
      ajax: true,
    }),
    {
      method: "GET",
      cache: "no-cache",
      headers: CF_API_HEADER,
    },
  );

  try {
    // If JSON was returned, the user is not authorized
    await check.json(); // -> { "error_message": "..." }
    console.debug("[CF-ADMIN] API user is not authorized");
    return false;
  } catch {
    // The response is the HTML of the admin menu, so the user is authorized
    console.debug("[CF-ADMIN] API user is authorized");
    return true;
  }
}

/** Authorize session to perform admin actions
 * @throws {Error} if authorization fails
 */
export async function authorize() {
  const authorized = await checkAuthorized();

  // short-circuit if already authorized
  if (authorized) return;

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
      headers: CF_API_HEADER,
    },
  );

  const status = LoginResponse.safeParse(await response.json());
  if (!status.success) {
    throw new Error(
      "[CF-ADMIN] Authorization failed (Invalid Response): " +
        status.error.message,
    );
  }

  if (status.data.result === "OK") {
    console.debug("[CF-ADMIN] Authorization successful");
    return;
  } else {
    throw new Error(
      "[CF-ADMIN] Authorization failed: " + status.data.error_message,
    );
  }
}

export type AdminChangeRoute = "product-manufacturer-maintenance";

export interface AdminChangeData
  extends Record<AdminChangeRoute, Record<string, unknown>> {
  "product-manufacturer-maintenance": {
    contact_id?: number;
    primary_id: number;
    web_page?: string;
    link_name?: string;
  };
}

class AdminChangeError extends Error {
  constructor(method: string, identifier?: string, error?: string | Error) {
    const formatted = `[CF-ADMIN] Admin change '${method}' failed${identifier ? ` for '${identifier}'` : ""}${error ? `: ${error instanceof Error ? error.message : error}` : ""}`;
    super(formatted);
    this.name = "AdminChangeError";
  }
}

export async function submitAdminChanges<Route extends AdminChangeRoute>(
  route: Route,
  data: AdminChangeData[Route],
  urlParams?: object,
  identifier?: string,
  batched = false,
) {
  // if (batched) {
  //   await new Promise((resolve) => setTimeout(resolve, 100)); // slight delay to avoid overwhelming the server
  // }
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, String(value));
  }
  const response = await fetchSession(
    urlJoinP(env.NEXT_PUBLIC_CF_HOST, [route], {
      ajax: true,
      url_page: "show",
      url_action: "save_changes",
      ...urlParams,
    }),
    {
      method: "POST",
      cache: "no-cache",
      body: formData,
    },
  );
  try {
    const json = await response.json();
    const error = z.object({ error_message: z.string() }).safeParse(json);
    if (error.success) {
      throw new AdminChangeError(route, identifier, error.data.error_message);
    }
    // Make sure an empty array was returned
    z.array(z.any(), { message: "Expected array response" })
      .refine((arr) => arr.length === 0, "Expected empty array")
      .parse(json);
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new AdminChangeError(route, identifier, "Invalid JSON response");
    } else if (e instanceof z.ZodError) {
      throw new AdminChangeError(route, identifier, e);
    } else {
      throw e;
    }
  }
}

export async function authorizedAction<T>(action: () => T | Promise<T>) {
  await authorize();
  return action();
}

/** Perform a batch of actions synchronously, using the same authorization call */
export async function authorizedBatchAction<T>(
  actions: (() => T | Promise<T>)[],
) {
  await authorize();
  const results: T[] = [];
  const errors: string[] = [];
  for (const action of actions) {
    try {
      results.push(await action());
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }
  return {
    results,
    errors,
  };
}
