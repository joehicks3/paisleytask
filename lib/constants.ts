import {
  Priority,
  EstimatedTime,
  AssignedTo,
} from "@/types/task";

export const priorities: Priority[] = [
  "Low",
  "Normal",
  "High",
  "Critical",
];

export const assignedUsers: AssignedTo[] = [
  "Joe",
  "Cheryl",
  "Joey",
];

export const estimatedTimes: EstimatedTime[] = [
  "<5 min",
  "5-15 min",
  "15-30 min",
  "30-60 min",
  "1-2 hours",
  "Half Day",
  "Full Day",
  "Multi-Day",
];