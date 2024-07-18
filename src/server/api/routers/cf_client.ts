import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { authorize, submitToken } from "../functions/cf_authorization";
import { getContacts } from "../functions/fetch_contacts";
import { ApiResponse, StatusOnlyApiResponse } from "../common";
import { Contact } from "~/server/db/types";

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
      .query(async ({ input: { contactId: _contactId } }) => {
        return; //await getCartItems(contactId);
      }),
  },
});
