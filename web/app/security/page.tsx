import AppShell from "@/src/components/AppShell";
import ScoreBadge from "@/src/components/ScoreBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const COMPLIANCE_ITEMS = [
  {
    area: "ERISA Compliance",
    status: "green" as const,
    lastReview: "Mar 2026",
    notes: "No findings — fully current",
  },
  {
    area: "Investment Policy Statement",
    status: "yellow" as const,
    lastReview: "Jan 2026",
    notes: "Renewal required by Jun 30, 2026",
  },
  {
    area: "Fidelity Bond Coverage",
    status: "green" as const,
    lastReview: "Feb 2026",
    notes: "$5M bond · 10% of plan assets",
  },
  {
    area: "404(c) Participant Protection",
    status: "green" as const,
    lastReview: "Mar 2026",
    notes: "All disclosures current",
  },
  {
    area: "Plan Document Review",
    status: "green" as const,
    lastReview: "Dec 2025",
    notes: "Restatement completed on schedule",
  },
  {
    area: "Fee Benchmarking Study",
    status: "red" as const,
    lastReview: "Jun 2025",
    notes: "Overdue — last study 11 months ago",
  },
  {
    area: "Cybersecurity Assessment",
    status: "yellow" as const,
    lastReview: "Nov 2025",
    notes: "Next review scheduled Jul 2026",
  },
];

const OPEN_ACTIONS = [
  {
    priority: "High",
    action: "Commission fee benchmarking study",
    due: "Overdue",
    owner: "Sarah Chen",
  },
  {
    priority: "Medium",
    action: "Renew Investment Policy Statement",
    due: "Jun 30, 2026",
    owner: "Legal & Compliance",
  },
  {
    priority: "Low",
    action: "Complete annual cybersecurity assessment",
    due: "Jul 31, 2026",
    owner: "IT Security",
  },
];

const AUDIT_LOG = [
  {
    date: "Apr 12, 2026",
    event: "DOL audit — no findings",
    outcome: "green" as const,
  },
  {
    date: "Dec 4, 2025",
    event: "Annual plan document restatement filed",
    outcome: "green" as const,
  },
  {
    date: "Oct 18, 2025",
    event: "Participant complaint resolved — fee disclosure",
    outcome: "yellow" as const,
  },
  {
    date: "Aug 1, 2025",
    event: "Third-party fiduciary review completed",
    outcome: "green" as const,
  },
];

export default function SecurityPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Security &amp; Compliance
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Fiduciary oversight · ERISA plan year 2026
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-xs font-normal mt-1 border-amber-300 bg-amber-50 text-amber-700"
          >
            3 Open Actions
          </Badge>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                Fiduciary Score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight text-emerald-600">
                94 / 100
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Good standing · 2 items need attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                Open Action Items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight">3</p>
              <p className="text-xs text-muted-foreground mt-1">
                1 high · 1 medium · 1 low priority
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                Last Full Audit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight">Apr 2026</p>
              <p className="text-xs text-emerald-600 mt-1">
                No material findings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Compliance checklist + audit log */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Compliance Checklist
                  </CardTitle>
                  <CardDescription className="mt-0.5">
                    7 areas tracked · 4 current · 3 require attention
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4 w-[240px]">
                      Compliance Area
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Review</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COMPLIANCE_ITEMS.map(({ area, status, lastReview, notes }) => (
                    <TableRow key={area}>
                      <TableCell className="pl-4 font-medium">
                        {area}
                      </TableCell>
                      <TableCell>
                        <ScoreBadge score={status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {lastReview}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs max-w-[200px]">
                        {notes}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Audit log */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Audit Log</CardTitle>
              <CardDescription className="mt-0.5">
                Recent regulatory &amp; compliance events
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {AUDIT_LOG.map(({ date, event, outcome }, i) => (
                  <div key={i} className="px-4 py-3.5 flex gap-3 items-start">
                    <div className="mt-1.5 shrink-0">
                      <div
                        className={`size-1.5 rounded-full ${
                          outcome === "green"
                            ? "bg-emerald-500"
                            : outcome === "yellow"
                            ? "bg-amber-400"
                            : "bg-red-500"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm leading-snug">{event}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Open action items */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Open Action Items</CardTitle>
            <CardDescription className="mt-0.5">
              Requires resolution before next fiduciary review cycle
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Priority</TableHead>
                  <TableHead>Action Required</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {OPEN_ACTIONS.map(({ priority, action, due, owner }) => (
                  <TableRow key={action}>
                    <TableCell className="pl-4">
                      <Badge
                        variant={
                          priority === "High"
                            ? "destructive"
                            : priority === "Medium"
                            ? "secondary"
                            : "outline"
                        }
                        className="font-medium"
                      >
                        {priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{action}</TableCell>
                    <TableCell
                      className={
                        due === "Overdue"
                          ? "text-red-600 font-medium"
                          : "text-muted-foreground tabular-nums"
                      }
                    >
                      {due}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {owner}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
