"use server";

import { revalidatePath } from "next/cache";
import { createTask, completeTask, updateTask } from "@/lib/taskService";
import { Task, AssignedTo } from "@/types/task";
import { redirect } from "next/navigation";

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

export async function updateTaskAction(formData: FormData) {
  const id = formData.get("id")?.toString();

  if (!id) {
    throw new Error("Missing task id.");
  }

  await updateTask(id, {
    title: formData.get("title")?.toString() ?? "",
    notes: formData.get("notes")?.toString() || null,
    assigned_to: (formData.get("assignedTo")?.toString() as AssignedTo) || null,
    priority: formData.get("priority")?.toString() as Task["priority"],
    estimated_time: formData.get("estimatedTime")?.toString() as Task["estimated_time"],
    deadline: formData.get("deadline")?.toString() || null,
  });

  redirect("/");
}