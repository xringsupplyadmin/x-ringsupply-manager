import ServerAuthWrapper from "~/components/server_auth";
import React from "react";

export const metadata = {
  title: "X-Ring Supply Management Dashboard",
  description: "Internal Use Only",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ServerAuthWrapper>{children}</ServerAuthWrapper>;
}
