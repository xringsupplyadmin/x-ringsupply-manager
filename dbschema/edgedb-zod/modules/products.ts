import { z } from "zod";

// #region products::Category
export const CreateCategorySchema = z.
  object({
    cfId: z.number().int().min(0), // std::int64
    code: z.string(), // std::str
    description: z.string(), // std::str
  });

export const UpdateCategorySchema = z.
  object({
    cfId: z.number().int().min(0), // std::int64
    code: z.string(), // std::str
    description: z.string(), // std::str
  });
// #endregion

// #region products::Department
export const CreateDepartmentSchema = z.
  object({
    cfId: z.number().int().min(0), // std::int64
    code: z.string(), // std::str
    description: z.string(), // std::str
  });

export const UpdateDepartmentSchema = z.
  object({
    cfId: z.number().int().min(0), // std::int64
    code: z.string(), // std::str
    description: z.string(), // std::str
  });
// #endregion

// #region products::Location
export const CreateLocationSchema = z.
  object({
    cfId: z.number().int().min(0), // std::int64
    code: z.string(), // std::str
    description: z.string(), // std::str
    inactive: z.boolean(), // std::bool
    internalUse: z.boolean(), // std::bool
  });

export const UpdateLocationSchema = z.
  object({
    cfId: z.number().int().min(0), // std::int64
    code: z.string(), // std::str
    description: z.string(), // std::str
    inactive: z.boolean(), // std::bool
    internalUse: z.boolean(), // std::bool
  });
// #endregion

// #region products::Manufacturer
export const CreateManufacturerSchema = z.
  object({
    cfId: z.number().int().min(0), // std::int64
    code: z.string(), // std::str
    description: z.string(), // std::str
    detailed_description: z.string().optional(), // std::str
    image_id: z.number().int().min(0).optional(), // std::int64
    inactive: z.boolean(), // std::bool
    meta_description: z.string().optional(), // std::str
  });

export const UpdateManufacturerSchema = z.
  object({
    cfId: z.number().int().min(0), // std::int64
    code: z.string(), // std::str
    description: z.string(), // std::str
    detailed_description: z.string().optional(), // std::str
    image_id: z.number().int().min(0).optional(), // std::int64
    inactive: z.boolean(), // std::bool
    meta_description: z.string().optional(), // std::str
  });
// #endregion

// #region products::Product
export const CreateProductSchema = z.
  object({
    upcCode: z.string().optional(), // std::str
    productCategoryIds: z.number().int().min(0).array().optional(), // array<std::int64>
    productTagIds: z.number().int().min(0).array().optional(), // array<std::int64>
    baseCost: z.number().min(0).max(1.7976931348623157e+308).optional(), // std::float64
    cfId: z.number().int().min(0), // std::int64
    code: z.string(), // std::str
    dateCreated: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
    description: z.string(), // std::str
    detailedDescription: z.string().optional(), // std::str
    imageId: z.number().int().min(0).optional(), // std::int64
    imageUrls: z.string().array().optional(), // array<std::str>
    linkName: z.string().optional(), // std::str
    listPrice: z.number().min(0).max(1.7976931348623157e+308).optional(), // std::float64
    manufacturerAdvertisedPrice: z.number().min(0).max(1.7976931348623157e+308).optional(), // std::float64
    manufacturerImageId: z.number().int().min(0).optional(), // std::int64
    manufacturerSku: z.string().optional(), // std::str
    model: z.string().optional(), // std::str
    productManufacturerId: z.number().int().min(0).optional(), // std::int64
    sortOrder: z.number().int().min(0).optional(), // std::int64
    timeChanged: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  });

export const UpdateProductSchema = z.
  object({
    upcCode: z.string().optional(), // std::str
    productCategoryIds: z.number().int().min(0).array().optional(), // array<std::int64>
    productTagIds: z.number().int().min(0).array().optional(), // array<std::int64>
    baseCost: z.number().min(0).max(1.7976931348623157e+308).optional(), // std::float64
    cfId: z.number().int().min(0), // std::int64
    code: z.string(), // std::str
    dateCreated: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
    description: z.string(), // std::str
    detailedDescription: z.string().optional(), // std::str
    imageId: z.number().int().min(0).optional(), // std::int64
    imageUrls: z.string().array().optional(), // array<std::str>
    linkName: z.string().optional(), // std::str
    listPrice: z.number().min(0).max(1.7976931348623157e+308).optional(), // std::float64
    manufacturerAdvertisedPrice: z.number().min(0).max(1.7976931348623157e+308).optional(), // std::float64
    manufacturerImageId: z.number().int().min(0).optional(), // std::int64
    manufacturerSku: z.string().optional(), // std::str
    model: z.string().optional(), // std::str
    productManufacturerId: z.number().int().min(0).optional(), // std::int64
    sortOrder: z.number().int().min(0).optional(), // std::int64
    timeChanged: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  });
// #endregion

// #region products::Tag
export const CreateTagSchema = z.
  object({
    cfId: z.number().int().min(0), // std::int64
    code: z.string(), // std::str
    description: z.string(), // std::str
    detailed_description: z.string().optional(), // std::str
    inactive: z.boolean(), // std::bool
    meta_description: z.string().optional(), // std::str
  });

export const UpdateTagSchema = z.
  object({
    cfId: z.number().int().min(0), // std::int64
    code: z.string(), // std::str
    description: z.string(), // std::str
    detailed_description: z.string().optional(), // std::str
    inactive: z.boolean(), // std::bool
    meta_description: z.string().optional(), // std::str
  });
// #endregion
