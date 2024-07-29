import makeFetchCookie from "fetch-cookie";
import { z, type ZodRawShape } from "zod";
import { env } from "~/env";

export const fetchSession = makeFetchCookie(fetch);

export const getConnectionKeyHeader = () => {
  return {
    "Connection-Key": env.CF_API_KEY,
  };
};

export const ApiResponse = <Data extends ZodRawShape>(data: Data) =>
  z.union([
    z.object({
      success: z.literal(true),
      ...data,
    }),
    z.object({
      success: z.literal(false),
      error: z.string(),
    }),
  ]);

export const StatusOnlyApiResponse = ApiResponse({});

export type ApiResponse<Data extends Record<string, unknown>> =
  | ({
      success: true;
    } & {
      [key in keyof Data]: Data[key];
    })
  | {
      success: false;
      error: string;
    };

export type StatusOnlyApiResponse = ApiResponse<Record<never, never>>;

export function batchAction<DataType, ReturnType>(
  data: DataType[],
  executor: (data: DataType[], index: number) => ReturnType,
  batchSize = 1000,
): ReturnType[] {
  // Short circuit if the data is small enough
  if (data.length < batchSize) {
    return [executor(data, 0)];
  }

  // Split the data into batches and process each batch, accumulating the results
  const result: ReturnType[] = [];
  for (let i = 0, index = 0; i < data.length; i += batchSize, index++) {
    const batch = data.slice(i, i + batchSize);
    const eResult = executor(batch, index);
    result.push(eResult);
  }
  return result;
}

export async function batchActionAsync<DataType, ReturnType>(
  data: DataType[],
  executor: (data: DataType[], index: number) => Promise<ReturnType>,
  batchSize = 1000,
): Promise<ReturnType[]> {
  // Short circuit if the data is small enough
  if (data.length < batchSize) {
    return [await executor(data, 0)];
  }

  // Split the data into batches and process each batch, accumulating the results
  const result: ReturnType[] = [];
  for (let i = 0, index = 0; i < data.length; i += batchSize, index++) {
    const batch = data.slice(i, i + batchSize);
    const eResult = await executor(batch, index);
    result.push(eResult);
  }
  return result;
}

export type TimingsRef = {
  origin: number;
  current: number;
  precision: number;
};

export function newTiming(precision = 2): TimingsRef {
  const current = Date.now();

  return {
    origin: current,
    current: current,
    precision: precision,
  };
}

export function timingSetMark(ref: TimingsRef): undefined {
  ref.current = Date.now();
}

export function timing(
  ref: TimingsRef,
  formatted: boolean,
  timeSinceOrigin = false,
): string {
  const current = Date.now();

  const elapsed =
    (current - (timeSinceOrigin ? ref.origin : ref.current)) / 1000;

  ref.current = Date.now();

  if (formatted) {
    const minutes = (elapsed / 60).toFixed(0);
    const seconds = (elapsed % 60).toFixed(ref.precision);
    return `${minutes}m:${seconds}s`;
  } else {
    return elapsed.toFixed(ref.precision);
  }
}

export function timingN(ref: TimingsRef, timeSinceOrigin = false): number {
  const current = Date.now();

  const elapsed =
    (current - (timeSinceOrigin ? ref.origin : ref.current)) / 1000;

  ref.current = Date.now();

  return elapsed;
}
