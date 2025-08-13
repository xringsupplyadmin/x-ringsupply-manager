import { auth, hasPermission } from "~/server/auth";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuListItem,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import React from "react";

export async function NavLinks() {
  const session = await auth();
  if (session?.user) {
    return (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem
            hidden={!hasPermission([{ module: "ProductEditor" }], session)}
          >
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-2 p-2 md:w-[400px] lg:w-[600px] lg:grid-cols-2">
                <NavigationMenuListItem
                  href="/admin/products/catalog"
                  title="View Catalog"
                >
                  View all currently imported products
                </NavigationMenuListItem>
                <NavigationMenuListItem
                  href="/admin/products/editor"
                  title="Editor"
                >
                  Manage multiple products at once
                </NavigationMenuListItem>
                <NavigationMenuListItem
                  href="/admin/products/import"
                  title="Import"
                >
                  Import products from a CoreFORCE generated CSV file
                </NavigationMenuListItem>
                <NavigationMenuListItem
                  href="/admin/products/export"
                  title="Export"
                >
                  Export products to a CoreFORCE compatible CSV file
                </NavigationMenuListItem>
                <NavigationMenuListItem
                  href="/admin/products/data-sync"
                  title="Data Sync"
                >
                  Keep taxonomy and product data in sync with CoreFORCE
                </NavigationMenuListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Utilities</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-2 p-2 md:w-[400px] lg:w-[600px] lg:grid-cols-2">
                <NavigationMenuListItem
                  href="/admin/sass-editor"
                  title="Stylesheet Editor"
                >
                  Edit stylesheets for use in SASS headers
                </NavigationMenuListItem>
                <NavigationMenuListItem
                  href="/admin/item-tags"
                  title="Item Tag Editor"
                >
                  Edit stylesheets for use in SASS headers
                </NavigationMenuListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem
            hidden={!hasPermission([{ module: "Klaviyo" }], session)}
          >
            <NavigationMenuTrigger>Klaviyo</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-2 p-2 md:w-[400px] lg:w-[600px] lg:grid-cols-2">
                <NavigationMenuListItem
                  href="/admin/klaviyo/catalog-import"
                  title="Catalog Import"
                >
                  Synchronize items for use in marketing emails
                </NavigationMenuListItem>
                <NavigationMenuListItem
                  href="/admin/klaviyo/category-sync"
                  title="Category Sync"
                >
                  Synchronize categories for catalog taxonomy
                </NavigationMenuListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
  } else {
    return null;
  }
}
