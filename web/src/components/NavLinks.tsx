"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/security", label: "Security" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-6 flex gap-0.5 h-11 items-end pb-0">
        {NAV_LINKS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 pb-2.5 pt-2 text-sm font-medium border-b-2 transition-colors",
                active
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
