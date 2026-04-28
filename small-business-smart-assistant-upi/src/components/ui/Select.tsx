import type React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export function Select({ className, label, error, id, children, ...props }: SelectProps) {
  const selectId = id || props.name || label || undefined;
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label htmlFor={selectId} className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={twMerge(
          clsx(
            "h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
            "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          ),
          error && "border-red-500 focus-visible:ring-red-500/30",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <div className="text-xs text-red-600">{error}</div> : null}
    </div>
  );
}

