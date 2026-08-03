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

export function getDeadlineColor(deadline: string | null) {
  if (!deadline) {
    return "text-zinc-500";
  }

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
  }).format(new Date());

  if (deadline === today) {
    return "text-green-400";
  }

  if (deadline < today) {
    return "text-red-400";
  }

  return "text-zinc-500";
}

