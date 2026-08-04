export type AssignedTo = "Joe" | "Cheryl" | "Joey";

export type Priority = "Low" | "Normal" | "High" | "Critical";

export type EstimatedTime =
  | "<5 min"
  | "5-15 min"
  | "15-30 min"
  | "30-60 min"
  | "1-2 hours"
  | "Half Day"
  | "Full Day"
  | "Multi-Day";

export type TaskStatus =
  | "Open"
  | "Waiting"
  | "Completed";

export type Task = {
  id: string;

  title: string;
  notes: string | null;

  created_at: string;
  deadline: string | null;

  assigned_to: AssignedTo | null;

  priority: Priority;
  estimated_time: EstimatedTime;

  status: TaskStatus;

  completed_at: string | null;
};

export type TaskFilter =
  | "all"
  | "today"
  | "week"
  | "overdue"
  | "quickwins";