"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={cn(
        "text-muted-foreground transition-colors hover:text-foreground",
        {
          "text-bold text-foreground": pathname.startsWith(href),
        },
      )}
    >
      {label}
    </Link>
  );
}
