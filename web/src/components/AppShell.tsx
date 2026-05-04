import { Separator } from "@/components/ui/separator";
import NavLinks from "./NavLinks";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="border-b bg-background sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold tracking-tight">
              Portl
            </span>
            <Separator orientation="vertical" className="h-4 mx-0.5" />
            <span className="text-xs font-medium bg-secondary text-secondary-foreground rounded px-2 py-0.5">
              TriSpan 401(k) Plan
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-tight">Sarah Chen</p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Head of Benefits
              </p>
            </div>
            <div className="size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
              SC
            </div>
          </div>
        </div>
      </header>

      <NavLinks />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
