import { serve } from "inngest/next";
import { inngest } from "~/server/api/inngest";
import { inngestFunctions } from "~/server/api/functions/inngest_master";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
});
