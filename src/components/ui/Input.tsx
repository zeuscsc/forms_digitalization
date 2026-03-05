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
  suffix?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, required, suffix, ...props }, ref) => {
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
              "flex min-h-[48px] w-full border border-hsbc-gray-300 bg-white px-4 py-3 text-base font-hsbc transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-hsbc-gray-400 focus-visible:outline-none focus-visible:border-b-2 focus-visible:border-b-hsbc-black disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-hsbc-red focus-visible:border-b-hsbc-red",
              suffix && "pr-16",
              className
            )}
            ref={ref}
            {...props}
          />
          {suffix && (
            <div className="absolute right-0 top-0 h-full flex items-center pr-4 pointer-events-none text-hsbc-gray-500 font-medium">
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <div className="mt-1.5 flex items-start gap-2 text-hsbc-red">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="18" height="18" fill="#DB0011"/>
              <rect x="7.8" y="3.8" width="2.4" height="10.4" fill="white"/>
            </svg>
            <p className="text-sm font-hsbc">{error}</p>
          </div>
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
