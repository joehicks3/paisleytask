"use client";

import { useTransition } from "react";
import { completeTaskAction } from "@/app/actions";

type CompleteCheckboxProps = {
  taskId: string;
};

export default function CompleteCheckbox({
  taskId,
}: CompleteCheckboxProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      disabled={isPending}
      className="h-5 w-5 cursor-pointer accent-fuchsia-500 disabled:opacity-50"
      onChange={() => {
        const formData = new FormData();
        formData.append("taskId", taskId);

        startTransition(async () => {
          await completeTaskAction(formData);
        });
      }}
    />
  );
}