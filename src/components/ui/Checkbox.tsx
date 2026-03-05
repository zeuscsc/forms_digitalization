import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <label className="group flex items-start gap-3 cursor-pointer select-none py-2 px-1">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="checkbox"
            className="peer sr-only"
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              "w-6 h-6 border transition-colors flex items-center justify-center",
              "border-hsbc-gray-400 bg-white",
              "peer-checked:bg-hsbc-black peer-checked:border-hsbc-black",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-hsbc-black peer-focus-visible:ring-offset-2",
              "peer-disabled:border-hsbc-gray-200 peer-disabled:bg-hsbc-gray-100 peer-disabled:cursor-not-allowed",
              error && "border-hsbc-red bg-red-50",
              className
            )}
          />
          <svg
            className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span
          className={cn(
            "text-base font-hsbc transition-colors",
            error ? "text-hsbc-red" : "text-hsbc-black",
            "group-hover:text-hsbc-black"
          )}
        >
          {label}
        </span>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
