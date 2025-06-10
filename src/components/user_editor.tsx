"use client";

import {
  ModulePermission,
  type UserWithPermission,
} from "~/server/api/v2/types/users";
import { api, withToastStatus } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";
import React, { useState } from "react";
import { VerticalSeparator } from "~/components/separator";
import { cn } from "~/lib/utils";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";

export function UserEditor({
  user,
  className,
  ...props
}: { user: UserWithPermission } & React.ComponentPropsWithoutRef<"div">) {
  const toast = useToast();
  const { mutate: updatePermissions, isPending: permissionUpdatePending } =
    api.v2.admin.users.updateModulePermissions.useMutation(
      withToastStatus(toast, {
        description: "Updating permissions",
      }),
    );
  const { mutate: updateFlag, isPending: flagUpdatePending } =
    api.v2.admin.users.updateFlag.useMutation(
      withToastStatus(toast, {
        description: "Updating flag",
      }),
    );

  const [permissions, setPermissions] = useState<ModulePermission[]>(
    user.permission?.modules ?? [],
  );
  const [flags, setFlags] = useState({
    verified: user.permission?.verified ?? false,
    administrator: user.permission?.administrator ?? false,
  });

  return (
    <div className={cn("flex flex-row gap-4", className)} {...props}>
      <div className={"flex basis-1/2 flex-col gap-2"}>
        <h2 className={"text-center text-lg"}>User information</h2>
        <p>Name: {user.name ?? "Unknown"}</p>
        <p>
          Email: {user.email} (
          {user.emailVerified ? "verified" : "not verified"})
        </p>
        <p>Created At: {user.createdAt?.toLocaleDateString() ?? "Unknown"}</p>
        <div className={"flex flex-row items-center gap-2"}>
          <Checkbox
            id={"administrator-select"}
            checked={flags.administrator}
            onCheckedChange={(checked) =>
              setFlags({ ...flags, administrator: checked === true })
            }
          />
          <Label htmlFor={"#administrator-select"}>Administrator</Label>
        </div>
        <div className={"flex flex-row items-center gap-2"}>
          <Checkbox
            id={"verified-select"}
            checked={flags.verified}
            onCheckedChange={(checked) => {
              setFlags({ ...flags, verified: checked === true });
              updateFlag({
                identifier: { id: user.id },
                flag: "verified",
                value: checked === true,
              });
            }}
          />
          <Label htmlFor={"#verified-select"}>Verified</Label>
        </div>
      </div>
      <VerticalSeparator />
      <div className={"flex basis-1/2 flex-col gap-2"}></div>
    </div>
  );
}
