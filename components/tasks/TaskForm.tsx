import { Task } from "@/types/task";
import { updateTaskAction } from "@/app/actions";

type TaskFormProps = {
  task: Task;
};

export default function TaskForm({ task }: TaskFormProps) {
    return (

<form action={updateTaskAction}>
<input
  type="hidden"
  name="id"
  value={task.id}
/>
<div className="space-y-2">
  <label className="text-sm font-medium">
    Title
  </label>

  <input
    name="title"
    defaultValue={task.title}
    required
    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
  />
</div>

<div className="space-y-2">
  <label className="text-sm font-medium">
    Notes
  </label>

  <textarea
    name="notes"
    defaultValue={task.notes ?? ""}
    rows={5}
    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
  />
</div>
<div className="grid grid-cols-2 gap-4">
<div className="space-y-2">
  <label className="text-sm font-medium">
    Assigned To
  </label>
    <select
    name="assignedTo"
    defaultValue={task.assigned_to ?? ""}
    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
    >
    <option value="">Unassigned</option>
    <option value="Joe">Joe</option>
    <option value="Cheryl">Cheryl</option>
    <option value="Joey">Joey</option>
    </select>
</div>

<div className="space-y-2">
  <label className="text-sm font-medium">
    Priority
  </label>
    <select
    name="priority"
    defaultValue={task.priority}
    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
    >
    <option>Low</option>
    <option>Normal</option>
    <option>High</option>
    <option>Critical</option>
    </select>
</div>

<div className="space-y-2">
  <label className="text-sm font-medium">
    Estimated Time
  </label>
<select
  name="estimatedTime"
  defaultValue={task.estimated_time}
  className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
>
  <option>{"<5 min"}</option>
  <option>5-15 min</option>
  <option>15-30 min</option>
  <option>30-60 min</option>
  <option>1-2 hours</option>
  <option>Half Day</option>
  <option>Full Day</option>
  <option>Multiple Days</option>
</select>
</div>

<div className="space-y-2">
  <label className="text-sm font-medium text-zinc-300">
    Deadline
  </label>

  <input
    type="date"
    name="deadline"
    defaultValue={task.deadline ?? ""}
    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
  />
</div>
</div>
<div className="mt-8 flex justify-end border-t border-zinc-800 pt-6">
  <button
    type="submit"
    className="rounded-md bg-fuchsia-600 px-5 py-2 font-medium hover:bg-fuchsia-500"
  >
    Save Changes
  </button>
</div>

</form>
)
};