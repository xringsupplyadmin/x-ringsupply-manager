import { type coreforce, type $default } from "@/dbschema/interfaces";
import { z } from "zod";

export type InsertContact = Omit<coreforce.Contact, "id">;
export type InsertCartItem = Omit<coreforce.CartItem, "id">;
export type InsertProductAddon = Omit<coreforce.ProductAddon, "id">;
export type InsertInngestError = Omit<$default.InngestError, "id">;

export const Contact = z.object({
  contactId: z.number(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  businessName: z.string().nullish(),
  company: z.string().nullish(),
  salutation: z.string().nullish(),
  address1: z.string().nullish(),
  address2: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  postalCode: z.string().nullish(),
  country: z.string().nullish(),
  primaryEmailAddress: z.string().nullish(),
  notes: z.string().nullish(),
  alternateEmail: z.string().nullish(),
  phoneNumbers: z.string().nullish(),
  phone: z.string().nullish(),
});
export type Contact = z.infer<typeof Contact>;

export const CartItem = z.object({
  cartItemId: z.number(),
  cartId: z.number(),
  productId: z.number(),
  description: z.string(),
  timeSubmitted: z.date(),
  quantity: z.number(),
  salePrice: z.number().default(0),
  unitPrice: z.number().default(0),
  upcCode: z.string().nullish(),
  manufacturerSku: z.string().nullish(),
  model: z.string().nullish(),
  listPrice: z.number().default(0),
  smallImageUrl: z.string(),
  imageUrl: z.string(),
});
export type CartItem = z.infer<typeof CartItem>;

export const ProductAddon = z.object({
  productAddonId: z.number(),
  productId: z.number(),
  description: z.string(),
  groupDescription: z.string().nullish(),
  salePrice: z.number(),
  sortOrder: z.number(),
  cartItemAddonId: z.number(),
  cartItemId: z.number(),
  quantity: z.number(),
});
export type ProductAddon = z.infer<typeof ProductAddon>;

export const CartItemWithAddons = CartItem.extend({
  addons: ProductAddon.array(),
});
export type CartItemWithAddons = z.infer<typeof CartItemWithAddons>;

export const Cart = Contact.extend({
  items: CartItemWithAddons.array(),
});
export type Cart = z.infer<typeof Cart>;

export const InngestError = z.object({
  functionId: z.string(),
  errorName: z.string(),
  message: z.string(),
  runId: z.string(),
  timestamp: z.date(),
});
export type InngestError = z.infer<typeof InngestError>;
