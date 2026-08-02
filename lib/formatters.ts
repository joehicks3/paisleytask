export function formatTaskDate(date: string | null) {
  if (!date) {
    return null;
  }

  const parsed = new Date(`${date}T00:00:00`);

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}