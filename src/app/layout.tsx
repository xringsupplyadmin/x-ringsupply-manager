import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "~/trpc/react";
import { env } from "~/env";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { CircleAlert } from "lucide-react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "~/components/ui/toaster";

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
          <TRPCReactProvider>{children}</TRPCReactProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
