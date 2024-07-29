import { parse } from "csv-parse/sync";
import { urlJoinP } from "url-join-ts";
import { env } from "~/env";
import { authorize } from "./cf_authorization";
import { type ApiResponse, fetchSession } from "../common";
import { type Contact } from "~/server/db/types";

/**
 * Replace the empty string '' with undefined
 * @param str The string
 * @returns The string if it is not empty, otherwise undefined
 */
function undefineEmpty(str: string | undefined) {
  if (!str || str.trim() === "") {
    return undefined;
  } else {
    return str;
  }
}

export async function fetchApiContacts(
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
          firstName: undefineEmpty(record.First),
          lastName: undefineEmpty(record.Last),
          businessName: undefineEmpty(record.BusinessName),
          company: undefineEmpty(record.Company),
          salutation: undefineEmpty(record.Salutation),
          address1: undefineEmpty(record.Address1),
          address2: undefineEmpty(record.Address2),
          city: undefineEmpty(record.City),
          state: undefineEmpty(record.State),
          postalCode: undefineEmpty(record.PostalCode),
          country: undefineEmpty(record.Country),
          primaryEmailAddress: undefineEmpty(record.PrimaryEmailAddress),
          notes: undefineEmpty(record.Notes),
          alternateEmail: undefineEmpty(record.AlternateEmail),
          phoneNumbers: undefineEmpty(record.PhoneNumbers),
          phone: undefineEmpty(record.Phone),
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
