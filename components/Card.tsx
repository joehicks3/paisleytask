type CardProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export default function Card({
  title,
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-900 shadow ${className}`}
    >
      {title && (
        <div className="border-b border-zinc-800 px-5 py-3">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
      )}

      <div className="p-5">{children}</div>
    </div>
  );
}