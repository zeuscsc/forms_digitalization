import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FieldTitle } from "./FieldTitle";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, required, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col">
        {label && (
          <FieldTitle required={required} htmlFor={props.id}>
            {label}
          </FieldTitle>
        )}
        <div className="relative">
          <input
            type={type}
            className={cn(
              "flex h-11 w-full border border-hsbc-gray-300 bg-white px-3 py-2 text-base font-hsbc transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-hsbc-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-hsbc-black disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-hsbc-red ring-hsbc-red focus-visible:ring-hsbc-red",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-hsbc-red font-hsbc">{error}</p>
        )}
        {!error && helperText && (
          <p className="mt-1.5 text-xs text-hsbc-gray-400 font-hsbc">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
