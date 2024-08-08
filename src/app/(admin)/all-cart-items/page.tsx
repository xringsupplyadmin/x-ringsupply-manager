import e from "@/dbschema/edgeql-js";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import client from "~/server/db/client";

export default async function ViewCartPage() {
  const items = (
    await e
      .group(
        e.select(e.coreforce.CartItem, (item) => ({
          filter: e.op("exists", item.contact.activeTask),
          id: true,
          description: true,
          smallImageUrl: true,
          quantity: true,
          unitPrice: true,
          contact: {
            firstName: true,
            lastName: true,
            primaryEmailAddress: true,
          },
        })),
        (item) => ({
          by: { contact: item.contact },
          id: true,
          description: true,
          smallImageUrl: true,
          quantity: true,
          unitPrice: true,
          contact: {
            firstName: true,
            lastName: true,
            primaryEmailAddress: true,
          },
        }),
      )
      .run(client)
  ).flatMap((g) => g.elements);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{/* Blank */}</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Line Price</TableHead>
            <TableHead>Contact Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
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
              <TableCell>
                {item.contact.firstName} {item.contact.lastName}
              </TableCell>
              <TableCell>{item.contact.primaryEmailAddress}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
