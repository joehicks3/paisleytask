"use client";

import { TaskFilter } from "./TaskBrowser";

type TaskFiltersProps = {
  selected: TaskFilter;
  onChange: (filter: TaskFilter) => void;
};

const filters: {
  value: TaskFilter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "today", label: "Due Today" },
  { value: "week", label: "Due This Week" },
  { value: "overdue", label: "Overdue" },
  { value: "quickwins", label: "Quick Wins" },
];

export default function TaskFilters({
  selected,
  onChange,
}: TaskFiltersProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isSelected = selected === filter.value;

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              isSelected
                ? "border-fuchsia-500 bg-fuchsia-600 text-white"
                : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-fuchsia-500 hover:text-white"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}