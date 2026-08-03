import { Task } from "@/types/task";

const priorityRank: Record<Task["priority"], number> = {
  Critical: 4,
  High: 3,
  Normal: 2,
  Low: 1,
};


export function sortDueToday(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    return (
      priorityRank[b.priority] -
      priorityRank[a.priority]
    );
  });
}


export function sortOverdue(tasks: Task[]) {
  return [...tasks].sort((a, b) => {

    if (!a.deadline) return 1;
    if (!b.deadline) return -1;

    const dateCompare =
      a.deadline.localeCompare(b.deadline);

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return (
      priorityRank[b.priority] -
      priorityRank[a.priority]
    );
  });
}


export function sortEverythingElse(tasks: Task[]) {
  return [...tasks].sort((a, b) => {

    // Tasks with deadlines first
    if (a.deadline && !b.deadline) {
      return -1;
    }

    if (!a.deadline && b.deadline) {
      return 1;
    }

    // Both have deadlines
    if (a.deadline && b.deadline) {
      const dateCompare =
        a.deadline.localeCompare(b.deadline);

      if (dateCompare !== 0) {
        return dateCompare;
      }
    }

    // Same date or both no deadline
    return (
      priorityRank[b.priority] -
      priorityRank[a.priority]
    );
  });
}