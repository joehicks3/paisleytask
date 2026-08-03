import TaskRow from "./TaskRow";
import { Task } from "@/types/task";

type TaskSectionProps = {
  title: string;
  tasks: Task[];
  defaultOpen?: boolean;
};

export default function TaskSection({
  title,
  tasks,
  defaultOpen = true,
}: TaskSectionProps) {
  return (
    <section className="mb-8">
      <details open={defaultOpen}>
        <summary className="cursor-pointer list-none text-lg font-semibold text-zinc-200">
          {title} ({tasks.length})
        </summary>

        <div className="mt-3 divide-y divide-zinc-800">
          {tasks.length === 0 ? (
            <div className="py-4 text-sm text-zinc-500">
              No tasks
            </div>
          ) : (
            tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
              />
            ))
          )}
        </div>
      </details>
    </section>
  );
}