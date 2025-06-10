import { qb } from "@/dbschema/query_builder";
import client from "~/server/db/client";
import { ModuleName, type UserIdentifier } from "~/server/api/v2/types/users";

const userWithPermission = qb.shape(qb.default.User, (u) => ({
  ...u["*"],
  permission: (p) => ({
    ...p["*"],
    modules: true,
  }),
}));

function filterUser(userScope: unknown, identifier: UserIdentifier) {
  return qb.shape(qb.default.User, (u) => {
    if (identifier.id) {
      return {
        filter_single: qb.op(u.id, "=", qb.uuid(identifier.id)),
      };
    } else if (identifier.email) {
      return {
        filter_single: qb.op(u.email, "=", identifier.email),
      };
    } else {
      throw new Error(
        "Invalid user identifier provided (must provide either id or email)",
      );
    }
  })(userScope);
}

export async function getUsers() {
  return await qb
    .select(qb.default.User, (u) => ({
      ...userWithPermission(u),
    }))
    .run(client);
}

export async function getUser(identifier: UserIdentifier) {
  return await qb
    .select(qb.default.User, (u) => ({
      ...userWithPermission(u),
      ...filterUser(u, identifier),
    }))
    .run(client);
}

export async function updateModulePermissions(
  identifier: UserIdentifier,
  modulePermissions: { moduleName: ModuleName; write: boolean }[],
) {
  return await qb
    .update(qb.default.UserPermission, (p) => ({
      set: {
        modules: modulePermissions,
      },
      ...filterUser(p.user, identifier),
    }))
    .run(client);
}

export async function updateFlag(
  identifier: UserIdentifier,
  flag: "verified" | "administrator",
  value: boolean,
) {
  return await qb
    .update(qb.default.UserPermission, (p) => ({
      set: {
        [flag]: value,
      },
      ...filterUser(p.user, identifier),
    }))
    .run(client);
}
