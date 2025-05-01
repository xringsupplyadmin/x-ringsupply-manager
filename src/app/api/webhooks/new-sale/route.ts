import { z } from "zod";

const DataParser = z.object({
  customer_email: z.string(),
  cart_items: z.array(
    z.object({
      item_id: z.coerce.number(),
      quantity: z.number(),
      unit_price: z.number(),
      discount: z.number(),
      name: z.string(),
      item_number: z.string(),
      product_id: z.coerce.number(),
      description: z.string(),
    }),
  ),
});

export async function POST(request: Request) {
  const data = await request.json();

  const event = DataParser.safeParse(data);

  if (!event.success) {
    // TODO: log error to klaviyo

    return new Response(JSON.stringify(event.error), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // TODO send to klaviyo

  return new Response(undefined, {
    status: 200,
  });
}
