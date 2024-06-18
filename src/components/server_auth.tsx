import { type Session } from "next-auth";
import { getServerAuthSession } from "~/server/auth";

export default async function ServerAuthWrapper({
  fallback,
  page,
}: {
  fallback?: JSX.Element;
  page: (session: Session) => JSX.Element;
}) {
  const session = await getServerAuthSession();
  if (!session?.user)
    return fallback ?? <p>You must be logged in to view this page</p>;
  return page(session);
}
