import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTasks } from "@/lib/taskService";
import TaskList from "@/components/TaskList";
import Header from "@/components/Header";
import QuickAddTask from "@/components/QuickAddTask";
import Card from "@/components/Card"

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const tasks = await getTasks();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Header email={user.email || ''}/>

        <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <Card title="New Task">
              <QuickAddTask />
          </Card>
          <Card title={`Open Tasks (${tasks.length})`}>
              <TaskList tasks={tasks} />
          </Card>
        </div>
      </div>
    </main>
  );
}