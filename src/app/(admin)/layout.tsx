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
import { getServerAuthSession } from "~/server/auth";

export const metadata = {
  title: "X-Ring Supply Management Dashboard",
  description: "Internal Use Only",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

async function NavLinks() {
  const session = await getServerAuthSession();
  if (session?.user) {
    return (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Emails</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-2 p-2 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                <NavigationMenuListItem
                  href="/admin/emails/task-manager/all"
                  title="Active Tasks"
                >
                  View all active email tasks
                </NavigationMenuListItem>
                <NavigationMenuListItem
                  href="/admin/emails/touchpoint-manager/all"
                  title="Touchpoints"
                >
                  View touchpoints for all contacts
                </NavigationMenuListItem>
                <NavigationMenuListItem
                  href="/admin/emails/contacts"
                  title="Contacts"
                >
                  Manage contacts for emails
                </NavigationMenuListItem>
                <NavigationMenuListItem
                  href="/admin/emails/all-cart-items"
                  title="Cart Items"
                >
                  View all items in abandoned carts
                </NavigationMenuListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
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
  const session = await getServerAuthSession();
  return (
    <>
      <nav className="flex items-center justify-between gap-4 bg-secondary p-4 text-secondary-foreground">
        <h1 className="text-2xl font-bold">X-Ring Supply</h1>
        <NavLinks />
        <div className="justify-right ml-auto flex flex-row items-center gap-4">
          <p className="text-center text-lg">
            {session && (
              <span>Logged in as {session.user?.name ?? "Unknown"}</span>
            )}
          </p>
          <Link
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="rounded-full bg-primary px-5 py-1 font-semibold text-primary-foreground no-underline transition hover:opacity-50"
          >
            {session ? "Sign out" : "Sign in"}
          </Link>
          <DarkModeToggle />
        </div>
      </nav>
      <main className="container flex flex-grow flex-col items-center justify-start bg-background py-6 text-foreground">
        {children}
      </main>
    </>
  );
}
