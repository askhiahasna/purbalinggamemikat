import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "accent" | "neutral" | "warning";
}

export function Badge({
  className,
  variant = "primary",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    primary: "bg-primary-50 text-primary-800 border-primary-200",
    secondary: "bg-secondary-50 text-secondary-800 border-secondary-200",
    accent: "bg-accent-50 text-accent-800 border-accent-200",
    neutral: "bg-gray-100 text-gray-800 border-gray-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
