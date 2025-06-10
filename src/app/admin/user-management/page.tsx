"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Spinner } from "~/components/spinner";
import { api } from "~/trpc/react";
import {
  type ModuleName,
  ModuleNames,
  User,
  type UserPermission,
  UserWithPermission,
} from "~/server/api/v2/types/users";
import {
  ErrorXIcon,
  SuccessCheckIcon,
  WarningCheckIcon,
} from "~/components/icons";
import { SimpleTooltip } from "~/components/ui/tooltip";
import { Edit, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default function UserManagementDashboard() {
  const { data: users, isLoading } = api.v2.admin.users.getAll.useQuery();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className={"w-0"}>Actions</TableHead>
          <TableHead className={"w-0"}>User Type</TableHead>
          <TableHead className={"w-0"}>Verification</TableHead>
          <TableHead>Name</TableHead>
          {ModuleNames.map((name) => (
            <TableHead key={name} className={"w-16"}>
              {name}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell colSpan={4 + ModuleNames.length}>
              <Spinner className={"mx-auto"} />
            </TableCell>
          </TableRow>
        )}
        {users?.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <UserManagementActions user={user} />
            </TableCell>
            <TableCell>
              {user.permission?.administrator ? "Administrator" : "User"}
            </TableCell>
            <TableCell className={"content-center"}>
              <VerifiedStatus user={user} />
            </TableCell>
            <TableCell className="font-medium">
              {user.name ?? "Unknown User"}
            </TableCell>
            {ModuleNames.map((name) => (
              <TableCell key={name}>
                <ModulePermissionDisplay
                  permission={user.permission}
                  moduleName={name}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function UserManagementActions({ user }: { user: User }) {
  return (
    <>
      <Button
        variant={"ghost"}
        size={"icon"}
        title={`Edit User ${user.name}`}
        asChild
      >
        <Link href={`/admin/user-management/${user.id}/edit`}>
          <Edit />
        </Link>
      </Button>
    </>
  );
}

function VerifiedStatus({ user }: { user: UserWithPermission }) {
  if (user.permission?.verified) {
    return (
      <SimpleTooltip title={"Verified User"}>
        <ShieldCheck className={"mx-auto"} />
      </SimpleTooltip>
    );
  } else {
    return (
      <SimpleTooltip title={"Unverified User"}>
        <ShieldAlert className={"mx-auto"} />
      </SimpleTooltip>
    );
  }
}

function ModulePermissionDisplay({
  permission,
  moduleName,
}: {
  permission: UserPermission | null;
  moduleName: ModuleName;
}) {
  if (permission?.administrator) {
    return (
      <SimpleTooltip title={"Full Access"}>
        <SuccessCheckIcon className={"mx-auto"} />
      </SimpleTooltip>
    );
  }

  const modulePermission = permission?.modules.find(
    (p) => p.moduleName === moduleName,
  );

  if (!modulePermission) {
    return (
      <SimpleTooltip title={"No Access"}>
        <ErrorXIcon className={"mx-auto"} />
      </SimpleTooltip>
    );
  }

  if (modulePermission.write) {
    return (
      <SimpleTooltip title={"Read/Write Access"}>
        <SuccessCheckIcon className={"mx-auto"} />
      </SimpleTooltip>
    );
  } else {
    return (
      <SimpleTooltip title={"Read Only"}>
        <WarningCheckIcon className={"mx-auto"} />
      </SimpleTooltip>
    );
  }
}
