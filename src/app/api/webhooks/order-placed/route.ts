import { z } from "zod";
import { getOrder } from "~/server/api/v2/coreforce/cf-orders-api";
import { trackOrder } from "~/server/api/v2/klaviyo/events/send_event";

const DataParser = z.object({
  data: z.object({
    orderId: z.coerce.number(),
  }),
});

export async function POST(request: Request) {
  const data = await request.json();

  const event = DataParser.safeParse(data);

  if (!event.success) {
    return new Response(JSON.stringify(event.error), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const order = await getOrder(event.data.data.orderId);

    if (!order) {
      return new Response("Order not found", {
        status: 404,
      });
    }

    const tracked = await trackOrder(order);

    return new Response(
      JSON.stringify({
        orderStatus: tracked,
      }),
      {
        status: 200,
      },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : e;
    return new Response(
      JSON.stringify({
        error: "Failed to fetch order " + event.data.data.orderId,
        message: message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
