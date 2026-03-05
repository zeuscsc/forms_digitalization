import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-white border-b md:border border-hsbc-gray-200 p-4 md:p-8 shadow-none md:shadow-lg",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card };
