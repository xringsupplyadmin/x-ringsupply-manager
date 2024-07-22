import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "~/trpc/react";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";

export const metadata = {
  title: "X-Ring Supply Email Dashboard",
  description: "Internal Use Only",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="flex min-h-screen flex-col justify-normal">
        <TRPCReactProvider>
          <nav className="flex items-center justify-between gap-4 bg-primary p-4 text-primary-foreground">
            <h1 className="text-2xl font-bold">X-Ring Supply</h1>
            <Link href="/task-manager/all" className="">
              Task Manager
            </Link>
            <Link href="/touchpoint-manager/all" className="">
              Touchpoint Manager
            </Link>
            <Link href="/contacts" className="">
              View Contacts
            </Link>
            <div className="justify-right ml-auto flex flex-row items-center gap-4">
              <p className="text-center text-lg text-white">
                {session && (
                  <span>Logged in as {session.user?.name ?? "Unknown"}</span>
                )}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-secondary px-5 py-1 font-semibold text-secondary-foreground no-underline transition hover:opacity-50"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </nav>
          <main className="container flex flex-grow flex-col items-center justify-start bg-background py-6 text-foreground">
            {children}
          </main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
