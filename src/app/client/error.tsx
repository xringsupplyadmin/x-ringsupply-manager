"use client";

import { PageSubtitle, PageTitle } from "~/components/headings";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const pathname = usePathname();

  return (
    <div className={"flex flex-1 flex-col items-center justify-center"}>
      <PageTitle>Something went wrong</PageTitle>
      <PageSubtitle>{error.message}</PageSubtitle>
      <p>
        <button onClick={() => reset()} className={"underline"}>
          Try again later
        </button>
        {" or "}
        <a href={"mailto:infotech@x-ringsupply.com"} className={"underline"}>
          contact an administrator
        </a>
      </p>
      <p className={"mt-16 flex flex-row gap-8 text-sm"}>
        <span>
          Digest:{" "}
          <span className={"italic"}>{error.digest ?? "Unknown Digest"}</span>
        </span>
        <span>|</span>
        <span>
          Pathname: <span className={"italic"}>{pathname}</span>
        </span>
      </p>
    </div>
  );
}
