import { z } from "zod";

// #region coreforce::CartItem
export const CreateCartItemSchema = z.
  object({
    cartId: z.number().int().min(0), // std::int64
    cartItemId: z.number().int().min(0), // std::int64
    description: z.string().optional(), // std::str
    imageUrl: z.string(), // std::str
    listPrice: z.number().min(0).max(1.7976931348623157e+308).optional(), // std::float64
    productId: z.number().int().min(0), // std::int64
    quantity: z.number().int().min(0), // std::int64
    smallImageUrl: z.string(), // std::str
    timeSubmitted: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/), // std::datetime
    unitPrice: z.number().min(0).max(1.7976931348623157e+308).optional(), // std::float64
  });

export const UpdateCartItemSchema = z.
  object({
    cartId: z.number().int().min(0), // std::int64
    cartItemId: z.number().int().min(0), // std::int64
    description: z.string().optional(), // std::str
    imageUrl: z.string(), // std::str
    listPrice: z.number().min(0).max(1.7976931348623157e+308).optional(), // std::float64
    productId: z.number().int().min(0), // std::int64
    quantity: z.number().int().min(0), // std::int64
    smallImageUrl: z.string(), // std::str
    timeSubmitted: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/), // std::datetime
    unitPrice: z.number().min(0).max(1.7976931348623157e+308).optional(), // std::float64
  });
// #endregion

// #region coreforce::Contact
export const CreateContactSchema = z.
  object({
    email: z.string(), // std::str
    cfContactId: z.number().int().min(0), // std::int64
    fullName: z.string(), // std::str
    unsubscribed: z.boolean().optional(), // std::bool
  });

export const UpdateContactSchema = z.
  object({
    email: z.string(), // std::str
    cfContactId: z.number().int().min(0), // std::int64
    fullName: z.string(), // std::str
    unsubscribed: z.boolean().optional(), // std::bool
  });
// #endregion

// #region coreforce::EmailTask
export const CreateEmailTaskSchema = z.
  object({
    origination: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
    sequence: z.number().int().min(0).optional(), // std::int64
  });

export const UpdateEmailTaskSchema = z.
  object({
    origination: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
    sequence: z.number().int().min(0).optional(), // std::int64
  });
// #endregion

// #region coreforce::EmailTaskStep
export const CreateEmailTaskStepSchema = z.
  object({
    message: z.string(), // std::str
    sequence: z.number().int().min(0), // std::int64
    success: z.boolean(), // std::bool
    time: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  });

export const UpdateEmailTaskStepSchema = z.
  object({
    message: z.string(), // std::str
    sequence: z.number().int().min(0), // std::int64
    success: z.boolean(), // std::bool
    time: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  });
// #endregion
