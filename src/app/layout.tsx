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
          <nav className="bg-primary text-primary-foreground flex items-center justify-between">
            <div className="justify-right ml-auto flex flex-row items-center gap-4 p-4">
              <p className="text-center text-lg text-white">
                {session && (
                  <span>Logged in as {session.user?.name ?? "Unknown"}</span>
                )}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="bg-secondary text-secondary-foreground rounded-full px-5 py-1 font-semibold no-underline transition hover:opacity-50"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </nav>
          <main className="bg-background text-foreground container flex flex-grow flex-col items-center justify-start py-6">
            {children}
          </main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
