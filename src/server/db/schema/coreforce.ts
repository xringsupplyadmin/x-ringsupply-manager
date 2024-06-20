import { relations } from "drizzle-orm";
import {
  integer,
  numeric,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { type z } from "zod";
import { createTable } from "../schema";

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

export const contactRelations = relations(contacts, ({ many }) => ({
  shoppingCartItems: many(shoppingCartItems),
}));

export const Contact = createSelectSchema(contacts);
export type Contact = z.infer<typeof Contact>;
export const InsertContact = createInsertSchema(contacts);
export type InsertContact = z.infer<typeof InsertContact>;

export const shoppingCartItems = createTable("shopping_cart_item", {
  shoppingCartItemId: integer("shopping_cart_item_id").notNull().primaryKey(),
  shoppingCartId: integer("shopping_cart_id").notNull(),
  productId: integer("product_id").notNull(),
  description: varchar("description", { length: 1000 }).default(""),
  time_submitted: timestamp("time_submitted", {
    mode: "date",
  }),
  quantity: integer("quantity").notNull(),
  salePrice: numeric("sale_price", currencyNumeric).default("0.0"),
  addonCount: integer("addon_count"),
  smallImageUrl: varchar("small_image_url", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }),
  discount: varchar("discount", { length: 10 }),
  savings: numeric("savings", currencyNumeric),
  inventoryQuantity: integer("inventory_quantity"),
  shoppingCartContactId: integer("shopping_cart_contact_id").references(
    () => contacts.id,
    {
      onDelete: "cascade",
      onUpdate: "cascade",
    },
  ),
});

export const shoppingCartItemRelations = relations(
  shoppingCartItems,
  ({ many, one }) => ({
    productAddons: many(productAddons),
    shoppingCartContact: one(contacts, {
      fields: [shoppingCartItems.shoppingCartContactId],
      references: [contacts.id],
    }),
  }),
);

export const ShoppingCartItem = createSelectSchema(shoppingCartItems);
export type ShoppingCartItem = z.infer<typeof ShoppingCartItem>;
export const InsertShoppingCartItem = createInsertSchema(shoppingCartItems);
export type InsertShoppingCartItem = z.infer<typeof InsertShoppingCartItem>;

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

export const productAddonRelations = relations(productAddons, ({ one }) => ({
  shoppingCartItem: one(shoppingCartItems, {
    fields: [productAddons.shoppingCartItemId],
    references: [shoppingCartItems.shoppingCartItemId],
  }),
}));

export const ProductAddon = createSelectSchema(productAddons);
export type ProductAddon = z.infer<typeof ProductAddon>;
export const InsertProductAddon = createInsertSchema(productAddons);
export type InsertProductAddon = z.infer<typeof InsertProductAddon>;
