import { z } from "zod";
import {
  CartTemplate,
  getTemplateHtml,
} from "~/components/email/cart_template";
import { env } from "~/env";
import { getAbandonedCarts } from "~/server/db/query/coreforce";

const CoreillaResponse = z.object({
  status: z.string(),
  id: z.string().nullish(),
});

export async function sendEmails() {
  const data = await getAbandonedCarts();

  const responses = [];

  for (const [sequence, contacts] of Object.entries(data)) {
    const carts = contacts.filter((c) => !!c.primaryEmailAddress);
    for await (const cart of carts) {
      const formData = new FormData();
      formData.set(
        "cart_contents_html",
        await getTemplateHtml(CartTemplate({ items: cart.items })),
      );
      formData.set("sequence", sequence);
      formData.set("email", "mmeredith@x-ringsupply.com");
      const name = [cart.firstName, cart.lastName].filter((s) => !!s).join(" ");
      formData.set("name", name === "" ? "Customer" : name);

      const rawResponse = await fetch(env.COREILLA_WEBHOOK_URL, {
        body: formData,
        method: "POST",
      });

      const response = CoreillaResponse.safeParse(await rawResponse.json());
      console.log(response);
      responses.push(response);
    }
  }
  return responses;
}
