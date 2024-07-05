import { type coreforce } from "@/dbschema/interfaces";
import { z } from "zod";

export type InsertContact = Omit<coreforce.Contact, "id">;
export type InsertCartItem = Omit<coreforce.CartItem, "id">;
export type InsertProductAddon = Omit<coreforce.ProductAddon, "id">;

export const Contact = z.object({
  contactId: z.number(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  businessName: z.string().optional(),
  company: z.string().optional(),
  salutation: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  primaryEmailAddress: z.string().optional(),
  notes: z.string().optional(),
  alternateEmail: z.string().optional(),
  phoneNumbers: z.string().optional(),
  phone: z.string().optional(),
});
export type Contact = z.infer<typeof Contact>;

export const CartItem = z.object({
  cartItemId: z.number(),
  cartId: z.number(),
  productId: z.number(),
  description: z.string().optional(),
  time_submitted: z.date(),
  quantity: z.number(),
  salePrice: z.number().default(0),
  unitPrice: z.number().default(0),
  upcCode: z.string().optional(),
  manufacturerSku: z.string().optional(),
  model: z.string().optional(),
  listPrice: z.number().default(0),
  smallImageUrl: z.string().optional(),
  imageUrl: z.string().optional(),
});
export type CartItem = z.infer<typeof CartItem>;

export const ProductAddon = z.object({
  productAddonId: z.number(),
  productId: z.number(),
  description: z.string(),
  groupDescription: z.string().optional(),
  salePrice: z.number(),
  sortOrder: z.number(),
  cartItemAddonId: z.number(),
  cartItemId: z.number(),
  quantity: z.number(),
});
export type ProductAddon = z.infer<typeof ProductAddon>;
