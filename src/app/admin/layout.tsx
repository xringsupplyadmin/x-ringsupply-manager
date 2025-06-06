import Link from "next/link";
import { DarkModeToggle } from "~/components/dark_mode_toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuListItem,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { auth, hasPermission } from "~/server/auth";
import ServerAuthWrapper from "~/components/server_auth";
import React from "react";
import Image from "next/image";
import logo from "@/public/x-ringsupply_logo.png";

export const metadata = {
  title: "X-Ring Supply Management Dashboard",
  description: "Internal Use Only",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

async function NavLinks() {
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <>
      <nav className="flex items-center justify-between gap-4 bg-secondary p-4 text-secondary-foreground">
        <Link href={"/admin"} title={"Home"}>
          <Image
            src={logo}
            alt={"X-Ring Supply"}
            className={"max-h-12 w-auto"}
          />
        </Link>
        <NavLinks />
        <div className="justify-right ml-auto flex flex-row items-center gap-4">
          <p className="text-center text-lg">
            {session && (
              <span>Logged in as {session.user?.name ?? "Unknown"}</span>
            )}
          </p>
          <Link
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="rounded-full bg-primary px-5 py-1 text-center font-semibold text-primary-foreground no-underline transition hover:opacity-50"
          >
            {session ? "Sign out" : "Sign in"}
          </Link>
          <DarkModeToggle />
        </div>
      </nav>
      <main className="container flex flex-grow flex-col items-center justify-start bg-background py-6 text-foreground">
        <ServerAuthWrapper>{children}</ServerAuthWrapper>
      </main>
    </>
  );
}
