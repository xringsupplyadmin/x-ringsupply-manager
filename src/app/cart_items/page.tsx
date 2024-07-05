import { getContactsWithCarts } from "~/server/db/query/coreforce";

export default async function CartItemsPage() {
  const contacts = await getContactsWithCarts(3);

  return <p>Found {contacts.length} users with items in their cart</p>;
}
