import { z } from "zod";
import { Contact } from "~/server/db/schema/coreforce";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { authorize, submitToken } from "../functions/cf_authorization";
import { getCartItems, getContacts } from "../functions/cf_fetch";
import { ApiResponse, StatusOnlyApiResponse } from "../common";

export const cfClientRouter = createTRPCRouter({
  authorization: {
    authorize: protectedProcedure
      .output(StatusOnlyApiResponse)
      .mutation(async () => {
        return await authorize();
      }),

    submitToken: protectedProcedure
      .input(
        z.object({
          token: z.string(),
        }),
      )
      .output(StatusOnlyApiResponse)
      .mutation(async ({ input: { token } }) => {
        return await submitToken(token);
      }),
  },
  admin: {
    getContacts: protectedProcedure
      .output(
        ApiResponse({
          contacts: Contact.array(),
        }),
      )
      .query(async () => {
        return await getContacts();
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
        return await getCartItems(contactId);
      }),
  },
});
