import { FaCheckCircle } from "react-icons/fa";
import { Badge } from "./ui";

export default function PremiumBadge() {
  return (
    <Badge
      tone="blue"
      className="shrink-0 border-blue-500/30 bg-blue-500/10 text-blue-300"
    >
      <FaCheckCircle aria-hidden="true" className="text-blue-400" />
      Premium
    </Badge>
  );
}
