import * as React from "react";
import { Wifi, Signal, BatteryFull } from "lucide-react";

export function MobileStatusBar() {
  return (
    <div className="bg-white flex justify-between items-center px-6 h-[40px] shadow-sm text-black sticky top-0 z-50 rounded-t-[2.8rem]">
      <div className="font-semibold text-sm tracking-wide">9:41</div>
      <div className="flex items-center space-x-2">
        <Signal size={16} fill="black" className="text-black" />
        <Wifi size={16} className="text-black" />
        <BatteryFull size={18} fill="black" className="text-black rotate-0" />
      </div>
    </div>
  );
}
