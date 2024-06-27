import { type SQL, sql } from "drizzle-orm";
import { type PgColumn, type PgTableWithColumns } from "drizzle-orm/pg-core";
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

export function getConflictInsertSet<DataType extends Record<string, unknown>>(
  table: PgTableWithColumns<{
    name: string;
    schema: string | undefined;
    columns: Record<keyof DataType, PgColumn>;
    dialect: "pg";
  }>,
  record: DataType,
  keys?: Partial<Record<keyof DataType | "*", boolean>>,
): Record<string, SQL> {
  let objKeys = Object.keys(record);

  if (keys) {
    objKeys = objKeys.filter((key) =>
      key in keys ? keys[key] : "*" in keys && keys["*"],
    );
  }

  return Object.fromEntries(
    objKeys.map((key) => [key, sql.raw(`excluded.${table[key]?.name ?? key}`)]),
  );
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
