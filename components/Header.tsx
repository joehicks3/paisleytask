type HeaderProps = {
  email: string;
};

export default function Header({ email }: HeaderProps) {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-fuchsia-500">
          🐾 PaisleyTask
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Personal Task Manager
        </p>
      </div>

      <div className="text-right">
        <div className="text-sm text-zinc-400">
          Signed in as
        </div>

        <div className="font-medium">
          {email}
        </div>
      </div>
    </header>
  );
}