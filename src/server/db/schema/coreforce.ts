import { relations } from "drizzle-orm";
import {
  foreignKey,
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

export const contacts = createTable(
  "contact",
  {
    id: integer("id"),
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
  },
  (contact) => ({
    pk: primaryKey({
      name: "abandoned_cart_contact_pk",
      columns: [contact.id],
    }),
  }),
);

export const contactRelations = relations(contacts, ({ many }) => ({
  cartItems: many(cartItems),
}));

export const Contact = createSelectSchema(contacts);
export type Contact = z.infer<typeof Contact>;
export const InsertContact = createInsertSchema(contacts);
export type InsertContact = z.infer<typeof InsertContact>;

export const cartItems = createTable(
  "cart_item",
  {
    cartItemId: integer("cart_item_id"),
    cartId: integer("cart_id").notNull(),
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
    contactId: integer("contact_id"),
  },
  (item) => ({
    pk: primaryKey({
      name: "abandoned_cart_cart_item_pk",
      columns: [item.cartItemId],
    }),
    shoppingCartItemFk: foreignKey({
      name: "abandoned_cart_item_contact_fk",
      columns: [item.cartItemId],
      foreignColumns: [contacts.id],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  }),
);

export const shoppingCartItemRelations = relations(
  cartItems,
  ({ many, one }) => ({
    productAddons: many(productAddons),
    cartContact: one(contacts, {
      fields: [cartItems.contactId],
      references: [contacts.id],
    }),
  }),
);

export const ShoppingCartItem = createSelectSchema(cartItems);
export type ShoppingCartItem = z.infer<typeof ShoppingCartItem>;
export const InsertShoppingCartItem = createInsertSchema(cartItems);
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
    cartItemAddonId: integer("cart_item_addon_id"),
    cartItemId: integer("scart_item_id"),
    quantity: integer("quantity"),
  },
  (addon) => ({
    pk: primaryKey({
      name: "abandoned_cart_product_addon_pk",
      columns: [addon.cartItemId, addon.productAddonId],
    }),
    shoppingCartItemFk: foreignKey({
      name: "abandoned_cart_product_addon_cart_item_fk",
      columns: [addon.cartItemId],
      foreignColumns: [cartItems.cartItemId],
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  }),
);

export const productAddonRelations = relations(productAddons, ({ one }) => ({
  shoppingCartItem: one(cartItems, {
    fields: [productAddons.cartItemId],
    references: [cartItems.cartItemId],
  }),
}));

export const ProductAddon = createSelectSchema(productAddons);
export type ProductAddon = z.infer<typeof ProductAddon>;
export const InsertProductAddon = createInsertSchema(productAddons);
export type InsertProductAddon = z.infer<typeof InsertProductAddon>;
