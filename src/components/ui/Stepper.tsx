import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StepperProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full py-4 bg-white sticky top-0 z-10 border-b border-hsbc-gray-200 px-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-hsbc-red uppercase tracking-widest">
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className="text-xs font-medium text-hsbc-gray-400">
          {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
        </span>
      </div>
      <div className="flex gap-1 w-full h-1 bg-hsbc-gray-200">
        {steps.map((_, index) => (
          <div
            key={index}
            className={cn(
              "flex-1 h-full transition-all duration-300",
              index <= currentStep ? "bg-hsbc-red" : "bg-hsbc-gray-200"
            )}
          />
        ))}
      </div>
      <h2 className="mt-3 text-lg font-bold text-hsbc-black truncate">
        {steps[currentStep]}
      </h2>
    </div>
  );
}
