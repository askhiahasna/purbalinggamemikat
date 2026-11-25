import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.97] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

    const variantStyles = {
      primary:
        "bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900 shadow-sm",
      secondary:
        "bg-secondary-500 text-primary-950 font-semibold hover:bg-secondary-400 active:bg-secondary-600 shadow-sm",
      accent:
        "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-sm",
      outline:
        "border border-primary-700 text-primary-700 hover:bg-primary-50 active:bg-primary-100",
      ghost:
        "text-primary-700 hover:bg-primary-50 active:bg-primary-100",
      link:
        "text-primary-700 underline-offset-4 hover:underline p-0 h-auto",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-6 py-3 gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
