import { inngest } from "../../inngest";
import { syncAll } from "../ecommerce/sync";
import logInngestError from "../emails/error_handling";

export const ecommerceAutosync = inngest.createFunction(
  {
    id: "ecommerce-autosync",
    name: "Scheduled Runner for Automatic Ecommerce Sync",
    onFailure: logInngestError,
  },
  { cron: "TZ=America/New_York 0 0,12 * * *" },
  async ({ step }) => {
    await step.invoke("sync-all", {
      function: syncAll,
      data: {},
    });
  },
);
