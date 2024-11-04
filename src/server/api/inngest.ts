import { EventSchemas, Inngest } from "inngest";
import emailsSchema from "./schemas/emails";
import retailstoreSchema from "./schemas/retailstore";
import ecommerceSchema from "./schemas/ecommerce";
import { z, type ZodTypeAny } from "zod";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "x-ring-supply",
  schemas: new EventSchemas().fromZod([
    ...retailstoreSchema,
    ...emailsSchema,
    ...ecommerceSchema,
  ]),
});

const RunData = z.object({
  run_id: z.string(),
  run_started_at: z.coerce.date(),
  ended_at: z.string().nullish(),
  status: z.enum(["Running", "Completed", "Failed", "Cancelled"]),
  output: z.unknown(),
  function_id: z.string(),
  function_version: z.number(),
  environment_id: z.string(),
  event_id: z.string().nullish(),
  batch_id: z.string().nullish(),
  original_run_id: z.string().nullish(),
  cron: z.string().nullish(),
});

async function getRuns(eventId: string) {
  const response = await fetch(
    `https://api.inngest.com/v1/events/${eventId}/runs`,
    {
      headers: {
        Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
      },
    },
  );
  const json = await response.json();
  return RunData.array().parse(json.data);
}

export async function getRunOutput<T extends ZodTypeAny>(
  eventId: string,
  outputSchema: T,
) {
  let runs = await getRuns(eventId);
  while (runs[0]!.status !== "Completed") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    runs = await getRuns(eventId);
    if (runs.length === 0)
      throw new Error("No runs found for event " + eventId);
    if (runs[0]!.status === "Failed" || runs[0]!.status === "Cancelled") {
      throw new Error(`Run ${runs[0]!.run_id} failed`);
    }
  }
  return {
    ...runs[0],
    output: outputSchema.parse(runs[0]!.output) as z.infer<T>,
  };
}
