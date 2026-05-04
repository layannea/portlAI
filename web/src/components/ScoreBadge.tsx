import { Badge } from "@/components/ui/badge";

const SCORE_STYLES: Record<
  "green" | "yellow" | "red",
  { label: string; className: string }
> = {
  green: {
    label: "Low Risk",
    className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
  },
  yellow: {
    label: "Medium Risk",
    className:
      "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
  },
  red: {
    label: "High Risk",
    className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
  },
};

interface ScoreBadgeProps {
  score: "green" | "yellow" | "red";
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  const { label, className } = SCORE_STYLES[score];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
