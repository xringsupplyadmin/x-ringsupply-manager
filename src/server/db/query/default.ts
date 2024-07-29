import e from "@/dbschema/edgeql-js";
import client from "../client";
import { type InsertInngestError } from "../types";

export async function getUserPermissions(userId: string) {
  const getPermissions = e.select(e.default.UserPermission, (p) => ({
    ...e.default.UserPermission["*"],
    filter_single: e.op(p.user.id, "=", e.uuid(userId)),
  }));

  const permissions = await getPermissions.run(client);

  if (!permissions) {
    const createPermissions = e.select(
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
      () => ({
        ...e.default.UserPermission["*"],
      }),
    );

    return await createPermissions.run(client);
  }

  return permissions;
}

export async function dbLogInngestError(error: InsertInngestError) {
  const insertError = e.insert(e.default.InngestError, error);

  return await insertError.run(client);
}
