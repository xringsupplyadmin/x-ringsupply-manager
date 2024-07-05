import { parse } from "csv-parse/sync";
import { urlJoinP } from "url-join-ts";
import { env } from "~/env";
import { authorize } from "./cf_authorization";
import { type ApiResponse, fetchSession } from "../common";
import { type Contact } from "~/server/db/types";

export async function getContacts(
  checkAuth = true,
): Promise<ApiResponse<{ contacts: Contact[] }>> {
  if (checkAuth) {
    const authorization = await authorize();

    if (!authorization.success) {
      return authorization;
    }
  }

  const response = await fetchSession(
    urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["contacts"], {
      ajax: true,
      url_action: "exportallcsv",
    }),
    {
      method: "GET",
      cache: "no-cache",
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
        const contact: Contact = {
          contactId: parseInt(record.ID!),
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
        };
        return contact;
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
