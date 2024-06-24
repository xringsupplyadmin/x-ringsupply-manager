import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { urlJoinP } from "url-join-ts";
import { z } from "zod";

const LoginResponse = z.union([
  z.object({
    result: z.literal("ERROR"),
    error_message: z.string(),
  }),
  z.object({
    result: z.literal("OK"),
    user_id: z.number(),
    contact_id: z.number(),
    client_id: z.number(),
    session_identifier: z.string(),
  }),
]);

const SubmitTokenResponse = z.union([
  z.object({
    go_to_uri: z.string(),
    error_message: z.optional(z.string()),
  }),
  z.object({
    go_to_uri: z.optional(z.string()),
    error_message: z.string(),
  }),
]);

const AuthorizationStatus = z.union([
  z.object({
    success: z.literal(true),
  }),
  z.object({
    success: z.literal(false),
    error: z.union([z.literal("INVALID_CREDENTIALS"), z.string()]),
  }),
]);

const SubmitTokenStatus = z.union([
  z.object({
    success: z.literal(true),
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
]);

export const cfClientRouter = createTRPCRouter({
  authorization: {
    authorize: protectedProcedure
      .input(
        z.object({
          username: z.string(),
          password: z.string(),
        }),
      )
      .output(AuthorizationStatus)
      .mutation(async ({ input: { username, password } }) => {
        const credentials = new FormData();
        credentials.append("user_name", username);
        credentials.append("password", password);

        const response: unknown = await (
          await fetch(
            urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["api.php"], {
              method: "login",
            }),
            {
              method: "POST",
              cache: "no-cache",
              body: credentials,
            },
          )
        ).json();

        const status = LoginResponse.safeParse(response);
        if (!status.success) {
          return {
            success: false,
            error: status.error.message,
          };
        }

        if (status.data.result === "OK") {
          return {
            success: true,
            token_required: false,
          };
        } else {
          return {
            success: false,
            error: status.data.error_message,
          };
        }
      }),

    submitToken: protectedProcedure
      .input(
        z.object({
          token: z.string(),
        }),
      )
      .output(SubmitTokenStatus)
      .mutation(async ({ input: { token } }) => {
        const authorization = new FormData();
        authorization.append("verification_code", token);
        authorization.append("computer_environment_private", "1");

        const response: unknown = await (
          await fetch(
            urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["authorizecomputer.php"], {
              ajax: true,
              url_action: "authorize_computer",
            }),
            {
              method: "POST",
              cache: "no-cache",
              body: authorization,
            },
          )
        ).json();

        const status = SubmitTokenResponse.safeParse(response);
        if (!status.success) {
          return {
            success: false,
            error: status.error.message,
          };
        }

        if (status.data.go_to_uri) {
          return {
            success: true,
          };
        } else {
          return {
            success: false,
            error: status.data.error_message ?? "Unknown error",
          };
        }
      }),
  },
  retailStore: {
    getCartItems: protectedProcedure
      .input(
        z.object({
          contactId: z.number(),
        }),
      )
      .query(async ({ input: { contactId } }) => {
        const response = await fetch(
          urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["retail-store-controller"], {
            method: "get_cart_items",
            contact_id: contactId,
          }),
          {
            method: "GET",
            cache: "no-cache",
          },
        );
      }),
  },
});
