"use client";

import { useRef } from "react";
import { addTask } from "@/app/actions";

export default function QuickAddTask() {
  const formRef = useRef<HTMLFormElement>(null);

  async function action(formData: FormData) {
    await addTask(formData);
    formRef.current?.reset();
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="flex gap-3"
    >
      <input
        type="text"
        name="title"
        placeholder="What needs to be done?"
        required
        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 outline-none focus:border-fuchsia-500"
      />

      <button
        type="submit"
        className="rounded-lg bg-fuchsia-600 px-5 py-2 font-medium hover:bg-fuchsia-500"
      >
        Add
      </button>
    </form>
  );
}