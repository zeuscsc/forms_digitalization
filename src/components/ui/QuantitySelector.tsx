import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FieldTitle } from "./FieldTitle";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QuantitySelectorProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  error?: string;
  required?: boolean;
}

const QuantitySelector = ({
  label,
  value,
  onChange,
  min = 0,
  max = 120,
  error,
  required,
}: QuantitySelectorProps) => {
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <div className="flex flex-col">
      {label && <FieldTitle required={required}>{label}</FieldTitle>}
      <div className="flex items-center">
        <button
          type="button"
          onClick={decrement}
          className="flex h-11 w-11 items-center justify-center border border-hsbc-gray-300 bg-white hover:bg-hsbc-gray-100 active:bg-hsbc-gray-200 transition-colors disabled:opacity-50"
          disabled={value <= min}
        >
          <span className="text-xl font-medium">−</span>
        </button>
        <div className="flex h-11 w-16 items-center justify-center border-y border-hsbc-gray-300 bg-white font-hsbc text-base">
          {value}
        </div>
        <button
          type="button"
          onClick={increment}
          className="flex h-11 w-11 items-center justify-center border border-hsbc-gray-300 bg-white hover:bg-hsbc-gray-100 active:bg-hsbc-gray-200 transition-colors disabled:opacity-50"
          disabled={value >= max}
        >
          <span className="text-xl font-medium">+</span>
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-hsbc-red font-hsbc">{error}</p>}
    </div>
  );
};

export { QuantitySelector };
