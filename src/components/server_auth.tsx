import type { ModuleName } from "@/dbschema/interfaces";
import { type Session } from "next-auth";
import { type ReactNode } from "react";
import { auth, hasPermission } from "~/server/auth";
import { PageTitle } from "~/components/headings";

const UnauthorizedHeader = (
  <PageTitle className={"pb-2 text-center"}>Authorization Error</PageTitle>
);

export default async function ServerAuthWrapper({
  fallback,
  page,
  modules,
  administrator,
  children,
}: {
  fallback?: ReactNode;
  page?: (session: Session) => ReactNode;
  modules?: ModuleName[];
  administrator?: boolean;
  children?: ReactNode;
}) {
  const session = await auth();
  if (!session?.user)
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div>
        {UnauthorizedHeader}
        <p className="pb-2 text-center text-lg">
          You must be logged in to view this page
        </p>
      </div>
    );

  if (!session.user.permissions.verified) {
    return (
      <div>
        {UnauthorizedHeader}
        <p className="pb-2 text-center text-lg">
          Please contact an administrator to verify your account
        </p>
      </div>
    );
  }

  if (administrator && !session.user.permissions.administrator) {
    return (
      <div>
        {UnauthorizedHeader}
        <p className="pb-2 text-center text-lg">
          You must be an administrator to view this page
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
        {UnauthorizedHeader}
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
      <>{page?.(session)}</>
      <>{children}</>
    </>
  );
}
