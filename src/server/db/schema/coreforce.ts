import {
  integer,
  varchar,
  timestamp,
  boolean,
  numeric,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";
import { createTable } from "../schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { type z } from "zod";
import { relations } from "drizzle-orm";

const currencyNumeric = { precision: 10, scale: 2 };

export const contacts = createTable("contact", {
  id: integer("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  businessName: varchar("business_name", { length: 255 }),
  company: varchar("company", { length: 255 }),
  salutation: varchar("salutation", { length: 10 }),
  address1: varchar("address1", { length: 255 }),
  address2: varchar("address2", { length: 255 }),
  city: varchar("city", { length: 50 }),
  state: varchar("state", { length: 50 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 50 }),
  primaryEmailAddress: varchar("primary_email_address", { length: 100 }),
  notes: varchar("notes", { length: 500 }),
  alternateEmail: varchar("alternate_email", { length: 255 }),
  phoneNumbers: varchar("phone_numbers", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
});

export const Contact = createSelectSchema(contacts);
export type Contact = z.infer<typeof Contact>;
export const InsertContact = createInsertSchema(contacts);
export type InsertContact = z.infer<typeof InsertContact>;

export const productAddons = createTable(
  "product_addon",
  {
    productAddonId: integer("product_addon_id").notNull(),
    productId: integer("product_id").notNull(),
    description: varchar("description", { length: 100 }).notNull(),
    groupDescription: varchar("group_description", { length: 100 }),
    manufacturerSku: varchar("manufacturer_sku", { length: 50 }),
    inventoryProductId: integer("inventory_product_id"),
    salePrice: numeric("sale_price", currencyNumeric),
    shoppingCartItemAddonId: integer("shopping_cart_item_addon_id"),
    shoppingCartItemId: integer("shopping_cart_item_id").references(
      () => shoppingCartItems.shoppingCartItemId,
      {
        onDelete: "cascade",
        onUpdate: "cascade",
      },
    ),
    quantity: integer("quantity"),
  },
  (addon) => ({
    pk: primaryKey({
      columns: [addon.shoppingCartItemId, addon.productAddonId],
    }),
  }),
);

export const addonRelations = relations(productAddons, ({ one }) => ({
  shoppingCartItem: one(shoppingCartItems, {
    fields: [productAddons.shoppingCartItemId],
    references: [shoppingCartItems.shoppingCartItemId],
  }),
}));

export const shoppingCartItems = createTable("shopping_cart_item", {
  shoppingCartItemId: integer("shopping_cart_item_id").primaryKey(),
  shoppingCartId: integer("shopping_cart_id"),
  productId: integer("product_id"),
  description: varchar("description", { length: 1000 }),
  time_submitted: timestamp("time_submitted", {
    mode: "date",
  }),
  quantity: integer("quantity"),
  salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
  productAddons: integer("product_addons"), // TODO: addon type
  addonCount: integer("addon_count"),
  smallImageUrl: varchar("small_image_url", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }),
  shoppingCartContactId: integer("shopping_cart_contact_id"),
});

export const cartItemRelations = relations(shoppingCartItems, ({ many }) => ({
  productAddons: many(productAddons),
}));
