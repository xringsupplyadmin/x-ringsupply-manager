import Link from "next/link";

export default function ChromeExtensionInstallPage() {
  return (
    <div className={"flex flex-1 flex-col items-center justify-center"}>
      <Link href={"/coreforce-patch-utility/dist.crx"}>Install Extension</Link>
    </div>
  );
}
