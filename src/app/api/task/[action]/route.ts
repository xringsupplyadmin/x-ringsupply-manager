import { z } from "zod";
import { inngest } from "~/server/api/inngest";

const CoreillaContact = z.object({
  full_name: z.string(),
  email: z.string().email(),
});

export async function POST(
  request: Request,
  { params }: { params: { action: string } },
) {
  const body = CoreillaContact.safeParse(await request.json());

  if (!body.success) {
    return new Response(JSON.stringify(body.error), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  let eventIds: { ids: string[] };
  if (params.action === "create") {
    eventIds = await inngest.send({
      name: "contact/create",
      data: {
        contact: {
          fullName: body.data.full_name,
          email: body.data.email,
        },
        createTask: true,
      },
    });
  } else if (params.action === "delete") {
    eventIds = await inngest.send({
      name: "contact/cancel.task",
      data: {
        email: body.data.email,
        reason: "Cart no longer abandoned",
      },
    });
  } else {
    return new Response("Invalid action", { status: 400 });
  }

  return new Response(JSON.stringify(eventIds.ids), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
