import { authorize } from "~/server/api/functions/cf_authorization";
import { inngest } from "../client";
import logInngestError from "./error_handling";

export const authorizeApi = inngest.createFunction(
  {
    id: "authorizeApi",
    name: "Authorize API",
    onFailure: logInngestError,
    rateLimit: {
      limit: 1,
      period: "60s",
    },
  },
  { event: "api/authorize" },
  async ({ step }) => {
    await step.run("authorize-api", async () => {
      const authResponse = await authorize();

      if (!authResponse.success) {
        throw new Error("Authorization failed: " + authResponse.error);
      }
    });
  },
);
