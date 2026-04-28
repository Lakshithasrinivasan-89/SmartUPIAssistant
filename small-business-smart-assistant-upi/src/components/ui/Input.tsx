import type React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ className, label, error, id, ...props }: InputProps) {
  const inputId = id || props.name || label || undefined;
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
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
      />
      {error ? <div className="text-xs text-red-600">{error}</div> : null}
    </div>
  );
}

