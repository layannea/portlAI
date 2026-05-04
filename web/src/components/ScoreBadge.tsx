import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STYLES: Record<"green" | "yellow" | "red", string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  yellow: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
};

const LABELS: Record<"green" | "yellow" | "red", string> = {
  green: "Low",
  yellow: "Medium",
  red: "High",
};

interface ScoreBadgeProps {
  score: "green" | "yellow" | "red";
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  return (
    <Badge variant="outline" className={cn("font-medium", STYLES[score])}>
      {LABELS[score]}
    </Badge>
  );
}
