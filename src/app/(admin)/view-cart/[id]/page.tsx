import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { getContact } from "~/server/db/query/coreforce";

export default async function ViewCartPage({
  params: { id },
}: {
  params: { id: string };
}) {
  let contact;
  try {
    contact = await getContact(id);
  } catch {
    contact = undefined;
  }

  let header;

  if (!contact) {
    header = "Unknown";
  } else {
    header = `${contact.firstName} ${contact.lastName}`;
  }

  return (
    <div>
      <h1 className="pb-2 text-center text-2xl font-bold">
        View cart of {header}
      </h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{/* Blank */}</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Line Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!contact ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Contact not found
              </TableCell>
            </TableRow>
          ) : (
            contact.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="h-32 w-32">
                  <Image
                    alt={item.description}
                    src={item.smallImageUrl}
                    width={300}
                    height={300}
                  />
                </TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>$&nbsp;{item.unitPrice}</TableCell>
                <TableCell>$&nbsp;{item.quantity * item.unitPrice}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
