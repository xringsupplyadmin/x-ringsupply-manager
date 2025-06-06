import type { ModuleName } from "@/dbschema/interfaces";
import { type Session } from "next-auth";
import type React from "react";
import { auth, hasPermission } from "~/server/auth";

export default async function ServerAuthWrapper({
  fallback,
  page,
  modules,
  children,
}: {
  fallback?: JSX.Element;
  page?: (session: Session) => React.ReactNode;
  modules?: ModuleName[];
  children?: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user)
    return (
      fallback ?? (
        <div>
          <h1 className="pb-2 text-center text-2xl font-bold">
            Error: Not signed in
          </h1>
          <p className="pb-2 text-center text-lg">
            You must be logged in to view this page
          </p>
        </div>
      )
    );

  if (!session.user.permissions.verified) {
    return (
      <div>
        <h1 className="pb-2 text-center text-2xl font-bold">
          Error: Account not verified
        </h1>
        <p className="pb-2 text-center text-lg">
          Please contact an administrator to verify your account
        </p>
      </div>
    );
  }

  if (
    modules &&
    !hasPermission(
      modules.map((m) => ({ module: m })),
      session,
    )
  ) {
    return (
      <div>
        <h1 className="pb-2 text-center text-2xl font-bold">
          Error: Insufficient permissions
        </h1>
        <p className="pb-2 text-center text-lg">
          You do not have permission to view this page
          <br />
          Requires: {modules.join(", ")}
        </p>
      </div>
    );
  }

  return (
    <>
      {page?.(session)}
      {children}
    </>
  );
}
