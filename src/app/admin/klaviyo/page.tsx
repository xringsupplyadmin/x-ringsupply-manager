"use client";

import { ArrowLeftRight } from "lucide-react";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { api, withToastStatus } from "~/trpc/react";

export default function KlaviyoDashboard() {
  const toast = useToast();
  const { isPending: syncPending, mutate: sync } =
    api.v2.klaviyo.catalog.sync.categories.useMutation(
      withToastStatus(toast, {
        description: "Syncing Klaviyo Categories",
        successMsg: ({ created, updated, deleted }) => [
          `Created ${created} categories`,
          `Updated ${updated} categories`,
          `Deleted ${deleted} categories`,
        ],
      }),
    );
  const { data: categoryCount, isLoading: countLoading } =
    api.v2.klaviyo.catalog.get.categories.count.useQuery();

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">Klaviyo Dashboard</h1>
      <p className="flex flex-row items-center gap-4">
        Categories in Klaviyo: {countLoading ? <Spinner /> : categoryCount}
        <Button
          icon={syncPending ? <Spinner /> : <ArrowLeftRight />}
          disabled={syncPending}
          onClick={() => sync()}
        >
          Sync
        </Button>
      </p>
    </div>
  );
}
