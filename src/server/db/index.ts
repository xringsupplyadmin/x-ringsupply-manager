import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
// import postgres from "postgres";

// import { env } from "~/env";
import * as coreforce from "./schema/coreforce";
import * as nextauth from "./schema/nextauth";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
// const globalForDb = globalThis as unknown as {
//   conn: postgres.Sql | undefined;
// };

// const conn = globalForDb.conn ?? postgres(env.POSTGRES_URL);
// if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(sql, { schema: { ...coreforce, ...nextauth } });
