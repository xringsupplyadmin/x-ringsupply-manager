import { type FailureEventPayload } from "inngest";
import { dbLogInngestError } from "~/server/db/query/default";

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

  await dbLogInngestError(payload);
}
