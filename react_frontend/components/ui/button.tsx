import * as React from "react"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline"
}

export const Button = React.forwardRef<HTMLButtonElement, Props>(function Button(
  { className = "", variant = "default", ...props },
  ref
) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2"
  const styles =
    variant === "outline"
      ? "border border-zinc-300 dark:border-zinc-700 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
      : "bg-emerald-600 text-white hover:bg-emerald-500"

  return <button ref={ref} className={`${base} ${styles} ${className}`} {...props} />
})
