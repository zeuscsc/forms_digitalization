import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RadioButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const RadioButton = React.forwardRef<HTMLInputElement, RadioButtonProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <label className="group flex items-center gap-3 cursor-pointer select-none py-2 px-1">
        <div className="relative flex items-center justify-center">
          <input
            type="radio"
            className="peer sr-only"
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              "w-6 h-6 border rounded-full transition-colors",
              "border-hsbc-gray-400 bg-white flex items-center justify-center",
              "peer-checked:border-hsbc-black",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-hsbc-black peer-focus-visible:ring-offset-2",
              className
            )}
          />
          <div className="absolute w-3 h-3 bg-hsbc-black rounded-full opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <span className="text-base font-hsbc text-hsbc-black group-hover:text-hsbc-black">
          {label}
        </span>
      </label>
    );
  }
);
RadioButton.displayName = "RadioButton";

interface RadioGroupProps {
  children: React.ReactNode;
  className?: string;
  error?: string;
}

const RadioGroup = ({ children, className, error }: RadioGroupProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn("flex flex-wrap gap-x-8 gap-y-4", className)}>
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-hsbc-red font-hsbc">{error}</p>}
    </div>
  );
};

export { RadioGroup, RadioButton };
