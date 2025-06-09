import ServerAuthWrapper from "~/components/server_auth";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ServerAuthWrapper modules={["ItemTags"]}>{children}</ServerAuthWrapper>
  );
}
