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
import { Separator } from "@/components/ui/separator";

const STATS = [
  {
    label: "Total Plan Assets",
    value: "$47.2M",
    sub: "+3.1% YTD",
    positive: true,
  },
  {
    label: "Active Participants",
    value: "1,847",
    sub: "of 2,100 eligible",
    positive: null,
  },
  {
    label: "Participation Rate",
    value: "78.4%",
    sub: "+2.1 pp vs last year",
    positive: true,
  },
  {
    label: "Avg Deferral Rate",
    value: "6.2%",
    sub: "3% employer match",
    positive: null,
  },
];

const FUNDS = [
  {
    name: "Core Plus Bond",
    ticker: "PIMIX",
    provider: "PIMCO",
    aum: "$4.2M",
    ytd: "+3.2%",
    oneYear: "+5.1%",
    risk: "green" as const,
  },
  {
    name: "Large Cap Growth",
    ticker: "FSPGX",
    provider: "Fidelity",
    aum: "$14.8M",
    ytd: "+8.7%",
    oneYear: "+21.3%",
    risk: "green" as const,
  },
  {
    name: "Mid Cap Value",
    ticker: "VMVAX",
    provider: "Vanguard",
    aum: "$8.1M",
    ytd: "+5.1%",
    oneYear: "+12.8%",
    risk: "yellow" as const,
  },
  {
    name: "Small Cap Blend",
    ticker: "SBSPX",
    provider: "T. Rowe Price",
    aum: "$5.6M",
    ytd: "+4.3%",
    oneYear: "+9.6%",
    risk: "yellow" as const,
  },
  {
    name: "Target Date 2045",
    ticker: "VTIVX",
    provider: "Vanguard",
    aum: "$10.2M",
    ytd: "+6.1%",
    oneYear: "+14.2%",
    risk: "green" as const,
  },
  {
    name: "Emerging Markets",
    ticker: "DFEMX",
    provider: "DFA",
    aum: "$2.1M",
    ytd: "-1.2%",
    oneYear: "+3.4%",
    risk: "red" as const,
  },
];

const ACTIVITY = [
  {
    date: "Jun 1, 2026",
    text: "Open enrollment window begins",
    upcoming: true,
  },
  {
    date: "May 15, 2026",
    text: "Q1 participant statements distributed",
    upcoming: false,
  },
  {
    date: "Apr 15, 2026",
    text: "Annual fee disclosure notices sent to all participants",
    upcoming: false,
  },
  {
    date: "Mar 28, 2026",
    text: "Investment committee quarterly review completed",
    upcoming: false,
  },
  {
    date: "Feb 14, 2026",
    text: "Fidelity bond renewed — $5M coverage secured",
    upcoming: false,
  },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Plan Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              As of May 2026 · Plan year Jan – Dec
            </p>
          </div>
          <Badge
            variant="secondary"
            className="text-xs mt-1 font-normal"
          >
            Annual Review Period
          </Badge>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ label, value, sub, positive }) => (
            <Card key={label}>
              <CardHeader>
                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                  {label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tracking-tight">{value}</p>
                <p
                  className={`text-xs mt-1 ${
                    positive === true
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {sub}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Two-column layout: investment table + sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
          {/* Investment options */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Investment Options
                  </CardTitle>
                  <CardDescription className="mt-0.5">
                    6 funds · $47.2M total plan assets
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-normal">
                  As of Apr 30
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4 w-[220px]">Fund</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead className="text-right">Plan AUM</TableHead>
                    <TableHead className="text-right">YTD</TableHead>
                    <TableHead className="text-right">1-Year</TableHead>
                    <TableHead>Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FUNDS.map((fund) => (
                    <TableRow key={fund.ticker}>
                      <TableCell className="pl-4">
                        <p className="font-medium">{fund.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {fund.ticker}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fund.provider}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fund.aum}
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums font-medium ${
                          fund.ytd.startsWith("-")
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {fund.ytd}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {fund.oneYear}
                      </TableCell>
                      <TableCell>
                        <ScoreBadge score={fund.risk} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent activity sidebar */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription className="mt-0.5">
                Plan events &amp; admin actions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {ACTIVITY.map(({ date, text, upcoming }, i) => (
                  <div key={i} className="px-4 py-3.5 flex gap-3">
                    <div className="mt-1.5 shrink-0">
                      <div
                        className={`size-1.5 rounded-full ${
                          upcoming
                            ? "bg-primary"
                            : "bg-muted-foreground/30"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm leading-snug">{text}</p>
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

        {/* Contribution breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                YTD Employee Contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight">$1.84M</p>
              <Separator className="my-3" />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pre-tax</span>
                  <span className="tabular-nums">$1.21M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Roth</span>
                  <span className="tabular-nums">$0.63M</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                YTD Employer Match
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight">$0.71M</p>
              <Separator className="my-3" />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Match rate</span>
                  <span>50% up to 6%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max annual</span>
                  <span className="tabular-nums">$3,500</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                Enrollment Snapshot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight">78.4%</p>
              <Separator className="my-3" />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Enrolled</span>
                  <span className="tabular-nums">1,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Not enrolled</span>
                  <span className="tabular-nums">253</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
