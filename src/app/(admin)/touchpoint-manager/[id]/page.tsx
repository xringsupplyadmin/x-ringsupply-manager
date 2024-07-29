import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { getContact, getContactsWithSteps } from "~/server/db/query/coreforce";
import { Check, X } from "lucide-react";
import { formatDate } from "~/lib/utils";

export default async function TouchpointManagerPage({
  params: { id },
}: {
  params: { id: string };
}) {
  let contacts;
  let header;

  if (id === "all") {
    header = "All Touchpoints";
    contacts = await getContactsWithSteps();
  } else if (id === "failed") {
    header = "Failed Touchpoints";
    contacts = await getContactsWithSteps(false);
  } else if (id === "success") {
    header = "Successful Touchpoints";
    contacts = await getContactsWithSteps(true);
  } else {
    try {
      const contact = await getContact(id);
      if (!contact) throw new Error("Contact not found");

      header = `Touchpoints for ${contact.firstName} ${contact.lastName}`;
      contacts = [contact];
    } catch {
      header = "Touchpoints for Unknown";
      contacts = undefined;
    }
  }

  return (
    <div>
      <h1 className="pb-2 text-center text-2xl font-bold">{header}</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Sequence</TableHead>
            <TableHead>Success</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!contacts ||
          contacts.length === 0 ||
          contacts.every((c) => c.steps.length === 0) ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                {!contacts ? "Contact not found" : "No touchpoints found"}
              </TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) =>
              contact.steps.map((step) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.lastName ?? "N/A"}</TableCell>
                  <TableCell>{contact.firstName ?? "N/A"}</TableCell>
                  <TableCell>{contact.primaryEmailAddress ?? "N/A"}</TableCell>
                  <TableCell>{step.sequence ?? "Internal Error"}</TableCell>
                  <TableCell>
                    {step.success ? (
                      <Check className="mx-auto bg-green-600 stroke-white" />
                    ) : (
                      <X className="mx-auto bg-red-600 stroke-white" />
                    )}
                  </TableCell>
                  <TableCell>{step.message}</TableCell>
                  <TableCell>{formatDate(step.time)}</TableCell>
                </TableRow>
              )),
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
}
