import { Priority } from "@/types/task";

export function getPriorityColor(priority: Priority) {
  switch (priority) {
    case "Low":
      return "bg-fuchsia-900 text-fuchsia-300";

    case "Normal":
      return "bg-green-900 text-green-300";

    case "High":
      return "bg-yellow-900 text-yellow-300";

    case "Critical":
      return "bg-red-900 text-red-300";

    default:
      return "bg-zinc-800 text-zinc-300";
  }
}