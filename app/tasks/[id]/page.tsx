import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getTask } from "@/lib/taskService";
import TaskForm from "@/components/tasks/TaskForm";
import Header from "@/components/Header";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TaskEditPage({
  params,
}: PageProps) {
    const supabase = await createClient();

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  redirect("/login");
}
  const { id } = await params;

  const task = await getTask(id);

  if (!task) {
    notFound();
  }

  return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
        <div className="max-w-4xl mx-auto">
          <Header email={user?.email || ''}/>
  
          <TaskForm task={task} />
        </div>
      </main>
  );
}