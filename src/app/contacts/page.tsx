import { api } from "~/trpc/server";

export default async function ContactsPage() {
  await api.contact.syncToDb();
  return <p>Contacts page</p>;
}
