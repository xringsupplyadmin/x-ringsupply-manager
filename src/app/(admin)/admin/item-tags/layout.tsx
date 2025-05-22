import ServerAuthWrapper from "~/components/server_auth";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ServerAuthWrapper page={() => children} modules={["ItemTags"]} />;
}
