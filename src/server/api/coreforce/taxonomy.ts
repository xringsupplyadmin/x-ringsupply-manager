import { parseApiResponse } from "./api_util";
import { makeApiRequest } from "./api_util";
import {
  CategoryResult,
  DepartmentResult,
  LocationResult,
  ManufacturerResult,
  TagResult,
} from "./types";

export async function apiGetCategories() {
  const response = await makeApiRequest("get_product_categories");
  return (
    await parseApiResponse(response, CategoryResult)
  ).product_categories.map((category) => ({
    cfId: category.product_category_id,
    code: category.product_category_code,
    description: category.description,
  }));
}

export async function apiGetDepartments() {
  const response = await makeApiRequest("get_product_departments");
  return (
    await parseApiResponse(response, DepartmentResult)
  ).product_departments.map((department) => ({
    cfId: department.product_department_id,
    code: department.product_department_code,
    description: department.description,
    categories: department.product_categories,
  }));
}

export async function apiGetManufacturers() {
  const response = await makeApiRequest("get_product_manufacturers");
  return (
    await parseApiResponse(response, ManufacturerResult)
  ).product_manufacturers.map((manufacturer) => ({
    cfId: manufacturer.product_manufacturer_id,
    code: manufacturer.product_manufacturer_code,
    description: manufacturer.description,
    detailedDescription: manufacturer.detailed_description,
    metaDescription: manufacturer.meta_description,
    imageId: manufacturer.image_id,
    inactive: manufacturer.inactive,
  }));
}

export async function apiGetTags() {
  const response = await makeApiRequest("get_product_tags");
  return (await parseApiResponse(response, TagResult)).product_tags.map(
    (tag) => ({
      cfId: tag.product_tag_id,
      code: tag.product_tag_code,
      description: tag.description,
      detailedDescription: tag.detailed_description,
      metaDescription: tag.meta_description,
      inactive: tag.inactive,
    }),
  );
}

export async function apiGetLocations() {
  const response = await makeApiRequest("get_locations");
  return (await parseApiResponse(response, LocationResult)).locations.map(
    (location) => ({
      cfId: location.location_id,
      code: location.location_code,
      description: location.description,
      internalUse: location.internal_use_only,
      inactive: location.inactive,
    }),
  );
}
