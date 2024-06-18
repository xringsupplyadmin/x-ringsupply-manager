import ServerAuthWrapper from "~/components/server_auth";

export default async function Home() {
  return <ServerAuthWrapper page={() => <p>Dashboard coming soon</p>} />;
}
