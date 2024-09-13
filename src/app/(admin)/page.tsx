import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

export default async function UnsubscribePage() {
  return (
    <main className="container flex items-center justify-center bg-background py-6 text-foreground">
      <Alert variant="destructive" className="w-3/5">
        <AlertDescription className="flex flex-row items-center gap-4">
          <AlertTriangle />
          <div className="flex flex-col">
            <p>
              Uhoh! You&apos;re probably here by mistake. This site is not
              intended for customer use.
            </p>
            <p>
              If you were brought here by a link in an email, please contact the
              store directly and we will get you where you need to be.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </main>
  );
}
