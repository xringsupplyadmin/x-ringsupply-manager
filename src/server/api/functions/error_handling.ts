import { type FailureEventPayload } from "inngest";
import client from "~/server/db/client";
import e from "@/dbschema/edgeql-js";

export default async function logInngestError({
  error,
  event,
  runId,
}: {
  error: Error;
  event: FailureEventPayload;
  runId: string;
}) {
  const payload = {
    functionId: event.data.function_id,
    errorName: error.name,
    message: error.message,
    runId,
  };

  await e.insert(e.default.InngestError, payload).run(client);
}
