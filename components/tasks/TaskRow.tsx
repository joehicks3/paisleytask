import { Task } from "@/types/task";
import CompleteCheckbox from "../CompleteCheckbox";
import { formatTaskDate } from "@/lib/formatters";
import { getPriorityColor, getDeadlineColor } from "@/lib/taskHelpers";
import Link from "next/link";

type TaskRowProps = {
  task: Task;
};

export default function TaskRow({ task }: TaskRowProps) {
  return (
<div className="flex items-start justify-between border-b border-zinc-800 py-4">

  <div className="flex items-start gap-3">
    
    <CompleteCheckbox taskId={task.id} />

    <div>
      <Link
        href={`/tasks/${task.id}`}
        className="font-medium text-zinc-100 hover:text-fuchsia-400 transition-colors"
      >
        {task.title}
      </Link>

      <div className="text-sm text-zinc-500">
        {task.estimated_time}
      </div>

      {task.notes && (
        <div className="mt-1 text-sm text-zinc-400">
          {task.notes}
        </div>
      )}
    </div>

  </div>


<div className="flex flex-col items-end gap-2">

  {task.deadline && (
    <div
      className={`text-sm ${getDeadlineColor(task.deadline)}`}
    >
      Due {formatTaskDate(task.deadline)}
    </div>
  )}

  <div
    className={`rounded-full px-3 py-1 text-xs font-bold ${getPriorityColor(task.priority)}`}
  >
    {task.priority}
  </div>

</div>

</div>
  );
}