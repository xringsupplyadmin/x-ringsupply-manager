import { api } from "~/trpc/server";
import { PageTitle } from "~/components/headings";
import { UserEditor } from "~/components/user_editor";

export default async function UserEditPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await api.v2.admin.users.get({
    id: userId,
  });

  return (
    <div className={"flex w-full flex-col gap-4"}>
      <PageTitle className={"text-center"}>
        Edit User {user?.name ?? "Unknown"}
      </PageTitle>
      {user ? <UserEditor user={user} /> : <p>User not found</p>}
    </div>
  );
}
