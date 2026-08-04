import { createClient } from "@/lib/supabase/server";
import { Task } from "@/types/task";

export async function getTasks(): Promise<Task[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("status", "Open")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    throw new Error("Unable to load tasks");
  }

  return data ?? [];
}

export async function createTask(
  title: string,
  notes: string | null,
  priority: Task["priority"],
  estimatedTime: Task["estimated_time"],
  assignedTo: Task["assigned_to"],
  deadline: string | null
) {
  const supabase = await createClient();

  const { error } = await supabase.from("tasks").insert({
    title,
    notes,
    priority,
    estimated_time: estimatedTime,
    assigned_to: assignedTo,
    deadline,
  });

  if (error) {
    console.error(error);
    throw new Error("Unable to create task.");
  }
}

export async function completeTask(taskId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({
      status: "Completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (error) {
    console.error(error);
    throw new Error("Unable to complete task.");
  }
}

export async function getTask(id: string): Promise<Task | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function updateTask(
  id: string,
  updates: Partial<Omit<Task, "id" | "created_at" | "completed_at">>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Unable to update task.");
  }
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) {
    console.error("Error deleting task:", error);
    throw new Error("Unable to delete task.");
  }
}