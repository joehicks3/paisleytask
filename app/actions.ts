"use server";

import { revalidatePath } from "next/cache";
import { createTask } from "@/lib/taskService";
import { completeTask } from "@/lib/taskService";

export async function addTask(formData: FormData) {
  const title = formData.get("title")?.toString().trim();

  if (!title) {
    throw new Error("Title is required.");
  }

  await createTask(
    title,
    formData.get("notes")?.toString() || null,
    (formData.get("priority")?.toString() as any) || "Normal",
    (formData.get("estimatedTime")?.toString() as any) || "30-60 min",
    (formData.get("assignedTo")?.toString() as any) || null,
    formData.get("deadline")?.toString() || null
  );

  revalidatePath("/");
}

export async function completeTaskAction(formData: FormData) {
  const taskId = formData.get("taskId")?.toString();

  if (!taskId) {
    throw new Error("Missing task id.");
  }

  await completeTask(taskId);

  revalidatePath("/");
}