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
import { qb } from "@/dbschema/query_builder";

export default async function ViewCartPage() {
  const items = (
    await qb
      .group(
        qb.select(qb.coreforce.CartItem, (item) => ({
          filter: qb.op("exists", item.contact.activeTask),
          id: true,
          description: true,
          smallImageUrl: true,
          quantity: true,
          unitPrice: true,
          contact: {
            fullName: true,
            email: true,
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
            fullName: true,
            email: true,
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
              <TableCell>{item.contact.fullName}</TableCell>
              <TableCell>{item.contact.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
