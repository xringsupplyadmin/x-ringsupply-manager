import { apiGetManufacturers } from "~/server/api/coreforce/taxonomy";
import { authorizedBatchAction, submitAdminChanges } from "./cf-admin-api";

type ManufacturerUpdate = {
  manufacturer: string;
} & (
  | {
      skipped: true;
    }
  | { skipped: false; linkName: string; webPage: string }
);

const prefix = "/product-manufacturer/" as const;
const MAX_LINK_NAME_LENGTH = 60 - prefix.length; // hardcoded limit in Coreforce

export async function updateManufacturerWebpages() {
  const manufacturers = await apiGetManufacturers();
  return await authorizedBatchAction(
    manufacturers.map((manufacturer) => {
      return async (): Promise<ManufacturerUpdate> => {
        // Ensure we have a link name that is not too long
        const linkName = (
          manufacturer.linkName ??
          manufacturer.code.toLowerCase().replace(/_/g, "-")
        )
          .replace(/^-|-$/, "")
          .substring(0, MAX_LINK_NAME_LENGTH);
        const webPage = `${prefix}${linkName}`;
        if (
          manufacturer.linkName === linkName &&
          manufacturer.webPage === webPage
        )
          return {
            manufacturer: manufacturer.code,
            skipped: true,
          };
        await submitAdminChanges(
          "product-manufacturer-maintenance",
          {
            contact_id: manufacturer.contactId,
            primary_id: manufacturer.cfId,
            web_page: webPage,
            link_name: linkName,
          },
          undefined,
          manufacturer.code,
        );
        return {
          manufacturer: manufacturer.code,
          skipped: false,
          linkName: linkName,
          webPage: webPage,
        };
      };
    }),
  );
}
