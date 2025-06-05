import { EdgeDBAdapter } from "@auth/edgedb-adapter";
import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import e from "@/dbschema/edgeql-js";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env";
import client from "./db/client";
import type { UserPermission } from "@/dbschema/interfaces";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      permissions: Omit<UserPermission, "user">;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthConfig = {
  callbacks: {
    session: async ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        permissions: await getOrCreatePermission(user.id),
      },
    }),
  },
  // @ts-expect-error: report to next-auth, not updated to gel types
  adapter: EdgeDBAdapter(client),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

const { auth, handlers } = NextAuth(authOptions);
export { handlers };

/**
 * Wrapper for `auth`
 * @deprecated Use `auth` directly instead
 */
export const getServerAuthSession = () => auth();

/**
 * Wrapper for `auth`
 */
export const getRouteAuthSession = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => auth(req, res);

export async function getOrCreatePermission(userId: string) {
  const permissionQuery = e.select(
    e
      .insert(e.default.UserPermission, {
        user: e.select(e.default.User, (u) => ({
          filter_single: e.op(u.id, "=", e.uuid(userId)),
        })),
      })
      .unlessConflict((p) => ({
        on: p.user,
        else: p,
      })),
    (p) => ({
      ...p["*"],
    }),
  );

  return await permissionQuery.run(client);
}
