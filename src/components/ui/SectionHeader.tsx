import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ title, subtitle, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full border-b border-hsbc-gray-300 pb-2 mb-6 mt-4 md:mt-8", className)}
        {...props}
      >
        <h3 className="text-lg md:text-xl font-medium text-hsbc-black font-hsbc uppercase tracking-wide leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs md:text-sm text-hsbc-gray-400 mt-1.5 font-hsbc leading-normal">
            {subtitle}
          </p>
        )}
      </div>
    );
  }
);
SectionHeader.displayName = "SectionHeader";

export { SectionHeader };
