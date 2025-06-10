import z from "zod";
import type {
  ModuleName as DbModuleName,
  User as DbUser,
  UserPermission as DbUserPermission,
} from "@/dbschema/interfaces";

export const ModuleNames = [
  "ItemTags",
  "ProductEditor",
  "CRM",
  "Klaviyo",
] as const;

export const ModuleName = z.enum(ModuleNames);
export type ModuleName = z.infer<typeof ModuleName>;

// Type guard to ensure that DB types exactly match local types
type Satisfy<base, t extends base> = t;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _MustMatchModuleNames = Satisfy<ModuleName, DbModuleName> &
  Satisfy<DbModuleName, ModuleName>;

export const UserIdentifier = z.union([
  z.object({
    id: z.string(),
    email: z.undefined(),
  }),
  z.object({
    id: z.undefined(),
    email: z.string().email(),
  }),
]);
export type UserIdentifier = z.infer<typeof UserIdentifier>;

export const ModulePermission = z.object({
  moduleName: ModuleName,
  write: z.boolean(),
});
export type ModulePermission = z.infer<typeof ModulePermission>;

/* Re-export types from DB without extra fields */

export type User = Omit<DbUser, "accounts" | "sessions" | "permission">;
export type UserPermission = Omit<DbUserPermission, "user">;
export type UserWithPermission = User & { permission: UserPermission | null };
