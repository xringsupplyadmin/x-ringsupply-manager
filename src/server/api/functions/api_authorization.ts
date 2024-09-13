import { urlJoinP } from "url-join-ts";
import { z } from "zod";
import { env } from "~/env";
import { fetchSession, CF_API_HEADER } from "~/lib/server_utils";
import { inngest } from "../inngest";
import logInngestError from "./error_handling";

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

export const authorizeApi = inngest.createFunction(
  {
    id: "authorizeApi",
    name: "Authorize API",
    onFailure: logInngestError,
  },
  { event: "api/authorize" },
  async ({ step, logger }) => {
    const authorized = await step.run("check-api-auth", async () => {
      logger.debug("[RetailStore] Checking API user");
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
        logger.debug("[RetailStore] API user is not authorized");
        return false;
      } catch {
        // The response is the HTML of the admin menu, so the user is authorized
        logger.debug("[RetailStore] API user is authorized");
        return true;
      }
    });

    if (authorized) {
      // Nothing to do if the user is already authorized
      return {
        success: true,
        skipped: true,
      };
    }

    await step.run("authorize-api", async () => {
      logger.debug("[RetailStore] Authorizing API user");

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
          "Authorization failed (Invalid Response): " + status.error.message,
        );
      }

      if (status.data.result === "OK") {
        logger.debug("[RetailStore] Authorization successful");
        return {
          success: true,
          skipped: false,
        };
      } else {
        throw new Error("Authorization failed: " + status.data.error_message);
      }
    });
  },
);
