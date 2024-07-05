import { edgedb } from "@/dbschema/edgeql-js/imports";
import { Transaction } from "edgedb/dist/transaction";

const client = edgedb.createClient();

const BATCH_SIZE = 500;

export async function batchTransaction<DataType, ReturnType>(
  data: DataType[],
  executor: (tx: Transaction, data: DataType[]) => Promise<ReturnType>,
): Promise<ReturnType[]> {
  const result: ReturnType[] = [];
  await client.transaction(async (tx) => {
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      const eResult = await executor(tx, batch);
      result.push(eResult);
    }
  });
  return result;
}

export default client;
