import ecommerceAutoSync from "./v2/ecommerce/autosync";
import ecommerceProduct from "./v2/ecommerce/products";
import ecommerceSync from "./v2/ecommerce/sync";
import klaviyoOrderTracking from "./v2/klaviyo/track_order";

export const inngestFunctions = [
  ...ecommerceAutoSync,
  ...ecommerceProduct,
  ...ecommerceSync,
  ...klaviyoOrderTracking,
];
