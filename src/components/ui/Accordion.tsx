import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border-t border-gray-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-4 bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-base font-medium text-gray-800">{title}</span>
        {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
      </button>
      {isOpen && <div className="pb-4 animate-in slide-in-from-top-2 duration-200">{children}</div>}
    </div>
  );
}
