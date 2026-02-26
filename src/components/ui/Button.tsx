import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "outline";
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", loading, ...props }, ref) => {
    const variants = {
      primary: "bg-hsbc-red text-white hover:bg-[#BA1110] active:bg-[#730014] disabled:bg-hsbc-gray-300",
      secondary: "bg-white text-hsbc-black border border-hsbc-black hover:bg-hsbc-gray-100 active:bg-hsbc-gray-200 disabled:border-hsbc-gray-300 disabled:text-hsbc-gray-300",
      tertiary: "bg-transparent text-hsbc-black hover:bg-hsbc-gray-100 active:bg-hsbc-gray-200 disabled:text-hsbc-gray-300",
      outline: "bg-transparent text-hsbc-black border border-hsbc-gray-300 hover:bg-hsbc-gray-100 active:bg-hsbc-gray-200 disabled:text-hsbc-gray-300",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center h-12 px-6 text-base font-medium font-hsbc transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hsbc-black focus-visible:ring-offset-2 disabled:pointer-events-none",
          variants[variant],
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {props.children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
