import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/security", label: "Security" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-6 flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold tracking-tight">Portl</span>
            <Separator orientation="vertical" className="h-5" />
            <span className="text-sm text-muted-foreground">
              TriSpan 401(k) Plan
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Sarah Chen · Head of Benefits
          </div>
        </div>
      </header>

      <nav className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-6 flex gap-1 h-10 items-center">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
