import { z } from "zod";

// #region default::Account
export const CreateAccountSchema = z.
  object({
    provider: z.string(), // std::str
    providerAccountId: z.string(), // std::str
    access_token: z.string().optional(), // std::str
    createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
    expires_at: z.number().int().min(0).optional(), // std::int64
    id_token: z.string().optional(), // std::str
    refresh_token: z.string().optional(), // std::str
    scope: z.string().optional(), // std::str
    session_state: z.string().optional(), // std::str
    token_type: z.string().optional(), // std::str
    type: z.string(), // std::str
  });

export const UpdateAccountSchema = z.
  object({
    provider: z.string(), // std::str
    providerAccountId: z.string(), // std::str
    access_token: z.string().optional(), // std::str
    createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
    expires_at: z.number().int().min(0).optional(), // std::int64
    id_token: z.string().optional(), // std::str
    refresh_token: z.string().optional(), // std::str
    scope: z.string().optional(), // std::str
    session_state: z.string().optional(), // std::str
    token_type: z.string().optional(), // std::str
    type: z.string(), // std::str
  });
// #endregion

// #region default::InngestError
export const CreateInngestErrorSchema = z.
  object({
    acknowledged: z.boolean().optional(), // std::bool
    errorName: z.string(), // std::str
    functionId: z.string(), // std::str
    message: z.string(), // std::str
    runId: z.string(), // std::str
    timestamp: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  });

export const UpdateInngestErrorSchema = z.
  object({
    acknowledged: z.boolean().optional(), // std::bool
    errorName: z.string(), // std::str
    functionId: z.string(), // std::str
    message: z.string(), // std::str
    runId: z.string(), // std::str
    timestamp: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  });
// #endregion

// #region default::Session
export const CreateSessionSchema = z.
  object({
    createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
    expires: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/), // std::datetime
    sessionToken: z.string(), // std::str
  });

export const UpdateSessionSchema = z.
  object({
    createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
    expires: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/), // std::datetime
    sessionToken: z.string(), // std::str
  });
// #endregion

// #region default::User
export const CreateUserSchema = z.
  object({
    createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
    email: z.string(), // std::str
    emailVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
    image: z.string().optional(), // std::str
    name: z.string().optional(), // std::str
  });

export const UpdateUserSchema = z.
  object({
    createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
    email: z.string(), // std::str
    emailVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
    image: z.string().optional(), // std::str
    name: z.string().optional(), // std::str
  });
// #endregion

// #region default::UserPermission
export const CreateUserPermissionSchema = z.
  object({
    verified: z.boolean().optional(), // std::bool
  });

export const UpdateUserPermissionSchema = z.
  object({
    verified: z.boolean().optional(), // std::bool
  });
// #endregion

// #region default::VerificationToken
export const CreateVerificationTokenSchema = z.
  object({
    identifier: z.string(), // std::str
    token: z.string(), // std::str
    createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
    expires: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/), // std::datetime
  });

export const UpdateVerificationTokenSchema = z.
  object({
    identifier: z.string(), // std::str
    token: z.string(), // std::str
    createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
    expires: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/), // std::datetime
  });
// #endregion
