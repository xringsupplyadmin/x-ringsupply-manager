import { type ReactNode } from "react";
import ServerAuthWrapper from "~/components/server_auth";

export default async function UserManagementLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ServerAuthWrapper administrator={true}>{children}</ServerAuthWrapper>;
}
