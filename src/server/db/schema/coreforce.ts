import { integer, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createTable } from "../schema";

export const contacts = createTable("contact", {
  id: integer("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  businessName: varchar("business_name", { length: 255 }),
  company: varchar("company", { length: 255 }),
  salutation: varchar("salutation", { length: 255 }),
  address1: varchar("address1", { length: 255 }),
  address2: varchar("address2", { length: 255 }),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 255 }),
  postalCode: varchar("postal_code", { length: 255 }),
  country: varchar("country", { length: 255 }),
  primaryEmailAddress: varchar("primary_email_address", { length: 255 }),
  dateCreated: timestamp("date_created", {
    mode: "date",
  }),
  contactType: varchar("contact_type", { length: 255 }),
  birthdate: timestamp("birthdate", {
    mode: "date",
  }),
  notes: varchar("notes", { length: 255 }),
  alternateEmail: varchar("alternate_email", { length: 255 }),
  phoneNumbers: varchar("phone_numbers", { length: 255 }),
  categories: varchar("categories", { length: 255 }),
  responsibleUser: varchar("responsible_user", { length: 255 }),
  response: varchar("response", { length: 255 }),
  phone: varchar("phone", { length: 255 }),
  taxExemptId: integer("tax_exempt_id"),
  coreguardEnabled: boolean("coreguard_enabled"),
  receiveTextNotification: boolean("receive_text_notification"),
  defaultFflDealer: integer("default_ffl_dealer"),
});
