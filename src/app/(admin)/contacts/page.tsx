import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { getContacts } from "~/server/db/query/coreforce";

export default async function TaskManagerPage() {
  const contacts = await getContacts({
    limit: 50,
  });

  return (
    <div>
      <h1 className="pb-2 text-center text-2xl font-bold">All Contacts</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Email Task</TableHead>
            <TableHead>Cart Items</TableHead>
            <TableHead>{/* Blank */}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No active tasks found
              </TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="max-w-48">
                  {/* Cap the width because some names are glitches */}
                  {contact.firstName ?? "N/A"}
                </TableCell>
                <TableCell>{contact.lastName ?? "N/A"}</TableCell>
                <TableCell>{contact.primaryEmailAddress ?? "N/A"}</TableCell>
                <TableCell>
                  {contact.activeTask ? (
                    <Link href={`/task-manager/${contact.id}`}>View Task</Link>
                  ) : (
                    "No Active Task"
                  )}
                </TableCell>
                <TableCell>{contact.items.length}</TableCell>
                <TableCell className="flex flex-row gap-2 align-middle">
                  <Link href={`/touchpoint-manager/${contact.id}`}>
                    View Touchpoints
                  </Link>
                  <Link href={`/view-cart/${contact.id}`}>View Cart</Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
