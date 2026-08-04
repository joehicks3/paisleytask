"use client";

import { useTransition } from "react";
import { deleteTaskAction } from "@/app/actions";

type DeleteTaskButtonProps = {
  taskId: string;
};

export default function DeleteTaskButton({
  taskId,
}: DeleteTaskButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      "Delete this task permanently? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    const formData = new FormData();
    formData.set("taskId", taskId);

    startTransition(async () => {
      await deleteTaskAction(formData);
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleDelete}
      className="rounded-md border border-red-800 px-5 py-2 font-medium text-red-400 transition-colors hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete Task"}
    </button>
  );
}