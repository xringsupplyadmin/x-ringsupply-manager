import { edgedb } from "@/dbschema/edgeql-js/imports";
import { type Transaction } from "edgedb/dist/transaction";

const client = edgedb.createClient();

const BATCH_SIZE = 500;

export async function batchTransaction<DataType, ReturnType>(
  data: DataType[],
  executor: (tx: Transaction, data: DataType[]) => Promise<ReturnType>,
): Promise<ReturnType[]> {
  const result: ReturnType[] = [];
  await client.transaction(async (tx) => {
    // Short circuit if the data is small enough
    if (data.length < BATCH_SIZE) {
      return [await executor(tx, data)];
    }

    // Split the data into batches and process each batch, accumulating the results
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      const eResult = await executor(tx, batch);
      result.push(eResult);
    }
  });
  return result;
}

export default client;
