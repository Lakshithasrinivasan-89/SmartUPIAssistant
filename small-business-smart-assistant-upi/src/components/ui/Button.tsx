import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center rounded-xl font-semibold transition",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          size === "sm" && "h-9 px-3 text-sm",
          size === "md" && "h-10 px-4 text-sm",
          size === "lg" && "h-12 px-6 text-base",
          variant === "primary" && "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-white",
          variant === "secondary" && "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-50 dark:hover:bg-white/20",
          variant === "ghost" && "bg-transparent text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-white/10",
          variant === "danger" && "bg-red-600 text-white hover:bg-red-500"
        ),
        className
      )}
      {...props}
    />
  );
}

