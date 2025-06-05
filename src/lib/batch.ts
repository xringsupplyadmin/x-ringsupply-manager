export function batch<T>(
  data: T[],
  executor: (batch: T[]) => void,
  batchSize = 100,
) {
  for (let i = 0; i < data.length; i += batchSize) {
    executor(data.slice(i, i + batchSize));
  }
}

export async function batchAsync<T>(
  data: T[],
  executor: (batch: T[]) => Promise<void>,
  batchSize = 100,
) {
  for (let i = 0; i < data.length; i += batchSize) {
    await executor(data.slice(i, i + batchSize));
  }
}
