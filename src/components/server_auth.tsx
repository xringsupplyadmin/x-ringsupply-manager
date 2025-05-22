import type { ModuleName } from "@/dbschema/interfaces";
import { type Session } from "next-auth";
import { getServerAuthSession } from "~/server/auth";

export default async function ServerAuthWrapper({
  fallback,
  page,
  module,
}: {
  fallback?: JSX.Element;
  page: (session: Session) => React.ReactNode;
  module?: ModuleName;
}) {
  const session = await getServerAuthSession();
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
    module &&
    !session.user.permissions.moduleRead.includes(module) &&
    !session.user.permissions.administrator
  ) {
    return (
      <div>
        <h1 className="pb-2 text-center text-2xl font-bold">
          Error: Insufficient permissions
        </h1>
        <p className="pb-2 text-center text-lg">
          You do not have permission to view pages in the {module} module
        </p>
      </div>
    );
  }

  return <>{page(session)}</>;
}
