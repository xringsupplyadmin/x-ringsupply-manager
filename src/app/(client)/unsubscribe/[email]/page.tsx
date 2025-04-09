import { AlertTriangle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { unsubscribeContact } from "~/server/db/query/coreforce";

export default async function UnsubscribePage({
  params,
}: {
  params: { email: string };
}) {
  const { email } = await params;
  let alert;
  const result = await unsubscribeContact(decodeURIComponent(email));

  if (result?.id) {
    alert = (
      <Alert variant="success" className="w-3/5">
        <AlertDescription className="flex flex-row items-center gap-4">
          <CheckCircle />
          You have been unsubscribed from email notifications about your cart.
        </AlertDescription>
      </Alert>
    );
  } else {
    alert = (
      <Alert variant="destructive" className="w-3/5">
        <AlertDescription className="flex flex-row items-center gap-4">
          <AlertTriangle />
          <div className="flex flex-col">
            <p>
              Something went wrong while unsubscribing you from email
              notifications.
            </p>
            <p>Please try again later or contact an administrator.</p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <main className="container flex items-center justify-center bg-background py-6 text-foreground">
      {alert}
    </main>
  );
}
