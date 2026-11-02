/** Shared insertion primitive: all callers retain their own Supabase auth/RLS context. */
export async function insertTask(client, values) {
  const { error } = await client.from("tasks").insert(values);
  if (error) throw new Error("Unable to create task.");
}

export function quickCaptureValues(title, now = new Date()) {
  return {
    title,
    notes: null,
    priority: "Normal",
    estimated_time: "30-60 min",
    assigned_to: null,
    deadline: null,
    status: "Open",
    created_at: now.toISOString(),
    completed_at: null,
  };
}
