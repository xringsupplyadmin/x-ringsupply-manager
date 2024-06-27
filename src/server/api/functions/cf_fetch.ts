import { parse } from "csv-parse/sync";
import { urlJoinP } from "url-join-ts";
import { env } from "~/env";
import { type Contact } from "~/server/db/schema/coreforce";
import { authorize } from "./cf_authorization";
import {
  type ApiResponse,
  getConnectionKeyHeader,
  fetchSession,
} from "../common";

export async function getContacts(): Promise<
  ApiResponse<{ contacts: Contact[] }>
> {
  const authorization = await authorize();

  if (!authorization.success) {
    return {
      success: false,
      error: authorization.error,
    };
  }

  const response = await fetchSession(
    urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["contacts"], {
      ajax: true,
      url_action: "exportallcsv",
    }),
    {
      method: "GET",
      cache: "no-cache",
      headers: getConnectionKeyHeader(),
      credentials: "include",
    },
  );

  try {
    await response.clone().json();
    return {
      success: false,
      error: "Authentication required",
    };
  } catch {}

  const csvData = await response.text();
  try {
    const parsed = parse(csvData, {
      delimiter: ",",
      columns: true,
      skip_empty_lines: true,

      on_record: (record: Record<string, string>) => {
        return {
          id: parseInt(record.ID!),
          firstName: record.First,
          lastName: record.Last,
          businessName: record.BusinessName,
          company: record.Company,
          salutation: record.Salutation,
          address1: record.Address1,
          address2: record.Address2,
          city: record.City,
          state: record.State,
          postalCode: record.PostalCode,
          country: record.Country,
          primaryEmailAddress: record.PrimaryEmailAddress,
          notes: record.Notes,
          alternateEmail: record.AlternateEmail,
          phoneNumbers: record.PhoneNumbers,
          phone: record.Phone,
        } as Contact;
      },
    }) as Contact[];

    return {
      success: true,
      contacts: parsed,
    };
  } catch {
    return {
      success: false,
      error: "Invalid response from Coreforce (Invalid Format)",
    };
  }
}

export async function getCartItems(contactId: number) {
  const response = await fetchSession(
    urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["retail-store-controller"], {
      method: "get_cart_items",
      contact_id: contactId,
    }),
    {
      method: "GET",
      cache: "no-cache",
      headers: getConnectionKeyHeader(),
    },
  );
}
