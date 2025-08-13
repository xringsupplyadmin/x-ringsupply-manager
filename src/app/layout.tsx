import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "~/trpc/react";
import { env } from "~/env";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { CircleAlert } from "lucide-react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "~/components/ui/toaster";
import React from "react";
import { TooltipProvider } from "~/components/ui/tooltip";
import Link from "next/link";
import Image from "next/image";
import { DarkModeToggle } from "~/components/dark_mode_toggle";
import { auth } from "~/server/auth";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Static Import
import logo from "@/public/x-ringsupply_logo.png";
import { NavLinks } from "~/components/nav";

export const metadata = {
  title: "X-Ring Supply",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning={true}
    >
      <body className="flex min-h-screen flex-col justify-normal bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <TRPCReactProvider>
              <nav className="flex items-center justify-between gap-4 bg-secondary p-4 text-secondary-foreground">
                <Link href={session ? "/admin" : "/client"} title={"Home"}>
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
                      <span>
                        Logged in as {session.user?.name ?? "Unknown"}
                      </span>
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
                {children}
              </main>
            </TRPCReactProvider>
            {(env.NODE_ENV !== "production" || env.DEBUG) && (
              <Alert className="fixed bottom-5 right-5 z-[9999] w-max p-2 opacity-50">
                <AlertDescription className="flex flex-row items-center gap-2">
                  <CircleAlert />
                  <span className="flex flex-col">
                    <span>
                      {env.NODE_ENV !== "production" && "Development Build"}
                    </span>
                    <span>{env.DEBUG && "Debug Mode"}</span>
                  </span>
                </AlertDescription>
              </Alert>
            )}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
