import { qb } from "@/dbschema/query_builder";
import { type FailureEventPayload } from "inngest";
import client from "~/server/db/client";

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

  await qb.insert(qb.default.InngestError, payload).run(client);
}
