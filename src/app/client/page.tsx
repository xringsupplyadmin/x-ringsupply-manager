import { env } from "~/env";
import { redirect } from "next/navigation";

export default async function ClientHomePage() {
  redirect(env.NEXT_PUBLIC_CF_HOST);
}
