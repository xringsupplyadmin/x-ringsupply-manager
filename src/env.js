import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import "dotenv/config"; 

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url(),
    ),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    CF_API_KEY: z.string(),
    CF_USERNAME: z.string(),
    CF_PASSWORD: z.string(),
    COREILLA_WEBHOOK_URL: z.string(),
    WATCHDOG_CRON: z.string(),
    EMAIL_SEQUENCE: z.string().transform((n) =>
      n
        .split(" ")
        .map((s) => parseFloat(s))
        .filter((s) => s >= 0)
        .sort(),
    ),
    MAX_AGE_THRESHOLD: z.string().transform((n) => parseInt(n)),
    MIN_AGE_THRESHOLD: z.string().transform((n) => parseInt(n)),
    FOLLOWUP_START_HOUR: z.string().transform((n) => parseInt(n)),
    FOLLOWUP_END_HOUR: z.string().transform((n) => parseInt(n)),
    DEBUG: z
      .string()
      .transform((s) => s.toLowerCase() === "true")
      .or(z.boolean()),
    DEBUG_CONTACT_ID: z.string().transform((s) => parseInt(s)),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_CF_HOST: z.string().url(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    CF_API_KEY: process.env.CF_API_KEY,
    NEXT_PUBLIC_CF_HOST: process.env.NEXT_PUBLIC_CF_HOST,
    CF_USERNAME: process.env.CF_USERNAME,
    CF_PASSWORD: process.env.CF_PASSWORD,
    COREILLA_WEBHOOK_URL: process.env.COREILLA_WEBHOOK_URL,
    WATCHDOG_CRON: process.env.WATCHDOG_CRON,
    EMAIL_SEQUENCE: process.env.EMAIL_SEQUENCE,
    MAX_AGE_THRESHOLD: process.env.MAX_AGE_THRESHOLD,
    MIN_AGE_THRESHOLD: process.env.MIN_AGE_THRESHOLD,
    FOLLOWUP_START_HOUR: process.env.FOLLOWUP_START_HOUR,
    FOLLOWUP_END_HOUR: process.env.FOLLOWUP_END_HOUR,
    DEBUG: process.env.DEBUG,
    DEBUG_CONTACT_ID: process.env.DEBUG_CONTACT_ID,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
