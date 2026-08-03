import { Task } from "@/types/task";
import TaskRow from "./tasks/TaskRow";

type TaskListProps = {
  tasks: Task[];
};

export default function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="mt-4 text-zinc-400">
        No tasks yet.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {tasks.map((task) => (
        <TaskRow 
          key={task.id}
          task={task}
        >
            
            </TaskRow>
      ))}
    </div>
  );
}