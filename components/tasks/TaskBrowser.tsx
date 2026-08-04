"use client";

import { useMemo, useState } from "react";

import { Task } from "@/types/task";
import TaskList from "@/components/TaskList";
import TaskFilters from "@/components/tasks/TaskFilters"

export type TaskFilter =
  | "all"
  | "today"
  | "week"
  | "overdue"
  | "quickwins";

type TaskBrowserProps = {
  tasks: Task[];
};

export default function TaskBrowser({
  tasks,
}: TaskBrowserProps) {
  const [filter, setFilter] = useState<TaskFilter>("all");

  const filteredTasks = useMemo(() => {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
    }).format(new Date());

    switch (filter) {
      case "today":
        return tasks.filter(
          (task) => task.deadline === today
        );

      case "overdue":
        return tasks.filter(
          (task) =>
            task.deadline !== null &&
            task.deadline < today
        );

      case "week": {
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const endDate = new Intl.DateTimeFormat("en-CA", {
          timeZone: "America/New_York",
        }).format(endOfWeek);

        return tasks.filter(
          (task) =>
            task.deadline !== null &&
            task.deadline >= today &&
            task.deadline <= endDate
        );
      }

      case "quickwins":
        return tasks.filter((task) =>
          [
            "<5 min",
            "5-15 min",
            "15-30 min",
          ].includes(task.estimated_time)
        );

      default:
        return tasks;
    }
  }, [tasks, filter]);

  return (
    <>
      <TaskFilters
        selected={filter}
        onChange={setFilter}
      />

      <TaskList tasks={filteredTasks} />
    </>
  );
}