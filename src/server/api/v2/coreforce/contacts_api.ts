import { z } from "zod";
import { makeApiRequest, parseApiResponse } from "../../coreforce/api_util";
import { CoreforceContact } from "../types/coreforce";

type FieldName =
  | "first_name"
  | "last_name"
  | "company_name"
  | "address_1"
  | "city"
  | "email_address"
  | "phone_number";

export async function getContact(field_name: FieldName, search_text: string) {
  const response = await makeApiRequest("get_contacts", {
    field_name: field_name,
    search_text: search_text,
  });

  const result = await parseApiResponse(
    response,
    z.object({
      contacts: CoreforceContact.array(),
    }),
  );

  if (result.contacts.length === 0) {
    return null;
  } else if (result.contacts.length > 1) {
    throw new Error("Multiple contacts found");
  } else {
    return result.contacts[0]!;
  }
}

export async function getContactById(contactId: number) {
  const response = await makeApiRequest("get_contacts", {
    contact_id: contactId,
  });

  const result = await parseApiResponse(
    response,
    z.object({
      contacts: CoreforceContact.array(),
    }),
  );

  if (result.contacts.length === 0) {
    return null;
  } else if (result.contacts.length > 1) {
    throw new Error("Multiple contacts found");
  } else {
    return result.contacts[0]!;
  }
}
