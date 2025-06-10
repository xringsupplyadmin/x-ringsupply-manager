import { TRPCError } from "@trpc/server";
import { moduleProcedure, protectedProcedure } from "../../trpc";

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.session.user.permissions.administrator) {
    throw new TRPCError({
      message: "You must be an administrator to perform this action.",
      code: "UNAUTHORIZED",
    });
  }

  return next({});
});

export const klaviyoProcedure = moduleProcedure(["Klaviyo"]);
