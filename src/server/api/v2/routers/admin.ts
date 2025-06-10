import { createTRPCRouter } from "../../trpc";
import { adminProcedure } from "~/server/api/v2/routers/procedures";
import {
  getUser,
  getUsers,
  updateFlag,
  updateModulePermissions,
} from "~/server/api/v2/admin/user_management";
import { ModulePermission, UserIdentifier } from "~/server/api/v2/types/users";
import z from "zod";

export const adminRouter = createTRPCRouter({
  users: {
    getAll: adminProcedure.query(async () => {
      return await getUsers();
    }),
    get: adminProcedure
      .input(UserIdentifier)
      .query(async ({ input: identifier }) => {
        return await getUser(identifier);
      }),
    updateModulePermissions: adminProcedure
      .input(
        z.object({
          identifier: UserIdentifier,
          permissions: ModulePermission.array(),
        }),
      )
      .mutation(async ({ input: { identifier, permissions } }) => {
        return await updateModulePermissions(identifier, permissions);
      }),
    updateFlag: adminProcedure
      .input(
        z.object({
          identifier: UserIdentifier,
          flag: z.enum(["verified", "administrator"]),
          value: z.boolean(),
        }),
      )
      .mutation(async ({ input: { identifier, flag, value } }) => {
        return await updateFlag(identifier, flag, value);
      }),
  },
});
