import Link from "next/link";
import { DarkModeToggle } from "~/components/dark_mode_toggle";
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
      <>
        <Link href="/admin/task-manager/all" className="">
          Task Manager
        </Link>
        <Link href="/admin/touchpoint-manager/all" className="">
          Touchpoint Manager
        </Link>
        <Link href="/admin/contacts" className="">
          View Contacts
        </Link>
        <Link href="/admin/all-cart-items" className="">
          All Cart Items
        </Link>
      </>
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
