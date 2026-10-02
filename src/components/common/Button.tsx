import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: "gradient-brand text-primary-foreground shadow-brand hover:opacity-95",
  outline: "glass-soft text-muted-foreground hover:text-foreground",
  ghost: "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[12px]",
  md: "px-5 py-2.5 text-sm",
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
    />
  );
}
