"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FileUpload } from "@/components/ui/FileUpload";
import ClaimPage from "./claim/page";
import ChangeInfoPage from "./change-info/page";
import { MobileStatusBar } from "@/components/ui/MobileStatusBar";
import { FileText, ArrowRight, ShieldCheck, Zap, Info, Settings, History, HelpCircle, Loader2, Smartphone } from "lucide-react";

export default function Home() {
  const [isUploaded, setIsUploaded] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [formType, setFormType] = useState<"claim" | "changeInfo" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const handleUploadSuccess = (file: File) => {
    setIsProcessing(true);
    setLogs([]);
    setIsUploaded(false);

    const steps = [
      { msg: "PDF Analysis & Data Extraction (PDF MCP)", delay: 800 },
      { msg: "Section Identification & Logical Grouping", delay: 2500 },
      { msg: "Schema Generation (Zod) for Validation", delay: 3800 },
      { msg: "HSBC Design Tokens Retrieval (Figma MCP)", delay: 5000 },
      { msg: "Component Library Selection (GDS)", delay: 6800 },
      { msg: "Next.js Page Scaffolding & Component Mapping", delay: 8200 },
      { msg: "Technical Integrity & UI Validation", delay: 9500 },
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        setLogs(prev => {
          // Mark previous active as complete
          const updated = prev.map(log => ({ ...log, status: 'complete' }));
          return [...updated, { status: index === steps.length - 1 ? 'complete' : 'active', msg: step.msg, time: timeStr }];
        });

        if (index === steps.length - 1) {
          setIsProcessing(false);
          setIsUploaded(true);
          if (file.name.toLowerCase().includes("change_of_customer_information")) {
            setFormType("changeInfo");
          } else {
            setFormType("claim");
          }
        }
      }, step.delay);
    });
  };

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      {/* Mini Sidebar - Google AI Studio style */}
      <aside className="w-16 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col items-center py-6 gap-8">
        <div className="w-10 h-10 flex items-center justify-center">
          <Image 
            src="/hsbc-logo.webp" 
            alt="HSBC Logo" 
            width={40} 
            height={40}
            className="object-contain"
          />
        </div>
        <nav className="flex flex-col gap-6">
          <button className="p-2.5 bg-red-50 text-hsbc-red rounded-xl transition-colors">
            <Zap size={22} />
          </button>
          <button className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors">
            <History size={22} />
          </button>
          <button className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings size={22} />
          </button>
        </nav>
        <div className="mt-auto flex flex-col gap-6">
          <button className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors">
            <HelpCircle size={22} />
          </button>
          <div className="w-8 h-8 bg-gray-100 rounded-full border border-gray-200"></div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Upload Panel */}
        <section className="w-[450px] flex-shrink-0 flex flex-col border-r border-gray-100 bg-white overflow-y-auto">
          <header className="p-8 border-b border-gray-50">
            <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
              Digitize Forms
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">
              Extract and transform PDF forms into mobile-ready digital experiences.
            </p>
          </header>

          <div className="flex-1 p-8 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Configuration</h3>
                <span className="text-[10px] bg-red-50 text-hsbc-red px-2 py-0.5 rounded-full font-bold">LIVE SYNC</span>
              </div>
              
              {!isUploaded && !isProcessing ? (
                <div className="space-y-8">
                  <FileUpload onUploadSuccess={handleUploadSuccess} />
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <Info className="text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        Upload a form or Change of Customer Information form. Our AI will automatically parse the document.
                      </p>
                    </div>
                  </div>
                </div>
              ) : isProcessing ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                   <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
                         <Loader2 className="animate-spin text-hsbc-red" size={28} />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mb-2">AI Extraction in Progress</h4>
                      <p className="text-xs text-gray-400 leading-relaxed font-medium px-4">
                        We're currently parsing the document and mapping it to HSBC's Design System.
                      </p>
                   </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="p-6 bg-green-50/50 rounded-2xl border border-green-100">
                    <div className="flex items-center gap-3 text-green-700 font-bold mb-3">
                      <ShieldCheck size={20} />
                      <span className="text-sm">Extraction Successful</span>
                    </div>
                    <p className="text-xs text-green-600 leading-relaxed">
                      All data points have been mapped. You can now review and edit the information in the mobile preview on the right.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={() => setIsUploaded(false)}
                      className="w-full py-4 px-6 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm"
                    >
                      <ArrowRight className="rotate-180" size={18} />
                      Upload New Document
                    </button>
                    
                    <button className="w-full py-4 px-6 bg-hsbc-red rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">
                      Sync to Backend
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-10 border-t border-gray-50">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Process Logs</h3>
               <div className="space-y-4">
                  {logs.length === 0 && !isProcessing && (
                    <p className="text-[10px] text-gray-400 font-bold italic">No logs available. Upload a document to start.</p>
                  )}
                  {logs.map((log: any, i) => (
                    <div key={i} className="flex items-start gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                      <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${log.status === 'active' ? 'bg-hsbc-red animate-pulse' : 'bg-green-500'}`}></div>
                      <div className="flex-1 flex justify-between gap-4">
                        <span className="text-xs font-medium text-gray-600">{log.msg}</span>
                        <span className="text-[10px] text-gray-400 font-bold">{log.time}</span>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </section>

        {/* Right Side: Preview Panel */}
        <main className="flex-1 bg-gray-50 relative overflow-hidden flex flex-col items-center justify-center p-12">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-40"></div>
          
          <div className="relative z-10 w-full flex flex-col items-center">
            {/* Context Tooltip */}
            <div className="mb-8 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <Smartphone size={16} className="text-gray-400" /> Device Mockup • Pixel 7
            </div>

            {/* Mobile Device Frame */}
            <div className="relative border-gray-900 bg-gray-900 border-[12px] rounded-[3.5rem] h-[780px] w-[375px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] scale-[0.85] md:scale-100 origin-top mb-16">
              {/* Speaker/Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-3xl z-50 flex items-center justify-center">
                <div className="w-12 h-1.5 bg-gray-800 rounded-full"></div>
              </div>
              
              {/* Side Buttons */}
              <div className="h-[46px] w-[3px] bg-gray-900 absolute -start-[15px] top-[124px] rounded-s-lg"></div>
              <div className="h-[46px] w-[3px] bg-gray-900 absolute -start-[15px] top-[178px] rounded-s-lg"></div>
              <div className="h-[64px] w-[3px] bg-gray-900 absolute -end-[15px] top-[142px] rounded-e-lg"></div>
              
              {/* Screen Content */}
              <div className="rounded-[2.8rem] overflow-hidden w-full h-full bg-white relative">
                <div className="absolute inset-0 overflow-y-auto scrollbar-hide">
                  {isProcessing ? (
                    <div className="h-full bg-white flex flex-col items-center justify-center p-8 text-center animate-pulse">
                      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-hsbc-red mb-6 relative">
                        <Zap size={40} className="animate-bounce" />
                        <div className="absolute inset-0 rounded-full border-4 border-hsbc-red border-t-transparent animate-spin"></div>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Analyzing Document...</h4>
                      <p className="text-sm text-gray-400 leading-relaxed font-medium px-4">
                        Please wait while our AI extracts and maps the form data.
                      </p>
                    </div>
                  ) : isUploaded ? (
                    <div className="animate-in fade-in duration-700 h-full">
                      {formType === "changeInfo" ? <ChangeInfoPage /> : <ClaimPage />}
                    </div>
                  ) : (
                    <div className="h-full bg-white flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
                        <FileText size={40} />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Awaiting Document</h4>
                      <p className="text-sm text-gray-400 leading-relaxed font-medium px-4">
                        Upload a form on the left to generate the interactive preview.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Resolution/Status Info */}
            <div className="mt-8 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex gap-10">
              <div className="flex items-center gap-2"><div className="w-1 h-1 bg-gray-300 rounded-full"></div> 1080 x 2400 (20:9)</div>
              <div className="flex items-center gap-2"><div className="w-1 h-1 bg-gray-300 rounded-full"></div> 411 DPI (Adaptive)</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
