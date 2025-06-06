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
            <TableHead>Name</TableHead>
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
                <TableCell>
                  {contact.fullName}
                </TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>
                  {contact.activeTask ? (
                    <Link href={`/src/app/admin/emails/task-manager/${contact.id}`}>
                      View Task
                    </Link>
                  ) : (
                    "No Active Task"
                  )}
                </TableCell>
                <TableCell>{contact.items.length}</TableCell>
                <TableCell className="flex flex-row gap-2 align-middle">
                  <Link href={`/src/app/admin/emails/touchpoint-manager/${contact.id}`}>
                    View Touchpoints
                  </Link>
                  <Link href={`/src/app/admin/emails/view-cart/${contact.id}`}>View Cart</Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
