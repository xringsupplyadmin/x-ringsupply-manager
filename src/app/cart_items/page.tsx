import { env } from "~/env";
import { getAbandonedCarts } from "~/server/db/query/coreforce";

export default async function CartItemsPage() {
  const data = await getAbandonedCarts();

  return (
    <>
      {Object.entries(data).map(([sequence, contacts]) => (
        <div key={`sequence-${sequence}`} className="pb-4">
          <p>
            {(parseInt(sequence) - 1) * env.FREQUENCY}-
            {parseInt(sequence) * env.FREQUENCY} days: {contacts.length}
          </p>
          <ul>
            {contacts.map(async (contact) => (
              <li key={contact.contactId}>
                {contact.firstName} {contact.lastName}
                <ul>
                  {contact.items.map((item) => (
                    <li key={item.cartItemId}>
                      {item.timeSubmitted.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
