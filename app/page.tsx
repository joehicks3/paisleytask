import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTasks } from "@/lib/taskService";
import TaskSection from "@/components/tasks/TaskSection";
import Header from "@/components/Header";
import QuickAddTask from "@/components/QuickAddTask";
import Card from "@/components/Card"
import { sortDueToday, sortOverdue, sortEverythingElse } from "@/lib/taskSorting";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const tasks = await getTasks();

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
  }).format(new Date());
  
  const dueToday = sortDueToday(
    tasks.filter(
      (task) => task.deadline === today
    )
  );
  
  const overdue = sortOverdue(
    tasks.filter(
      (task) =>
        task.deadline &&
        task.deadline < today
    )
  );
  
  const everythingElse = sortEverythingElse(
    tasks.filter(
      (task) =>
        !task.deadline ||
        task.deadline > today
    )
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Header email={user.email || ''}/>

        <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <Card title="New Task">
              <QuickAddTask />
          </Card>
          <TaskSection
            title="Due Today"
            tasks={dueToday}
          />

          <TaskSection
            title="Overdue"
            tasks={overdue}
          />

          <TaskSection
            title="Everything Else"
            tasks={everythingElse}
          />
        </div>
        </div>
    </main>
  );
}