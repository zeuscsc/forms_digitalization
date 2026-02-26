import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FieldTitleProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
}

const FieldTitle = React.forwardRef<HTMLLabelElement, FieldTitleProps>(
  ({ children, required, className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-base font-normal text-hsbc-black font-hsbc mb-1.5 block",
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-hsbc-red ml-1">*</span>}
      </label>
    );
  }
);
FieldTitle.displayName = "FieldTitle";

export { FieldTitle };
