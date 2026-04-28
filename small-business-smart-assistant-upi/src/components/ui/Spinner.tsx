export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-50" />
      {label ? <div className="text-sm text-zinc-700 dark:text-zinc-200">{label}</div> : null}
    </div>
  );
}

