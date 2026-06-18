"use client";

import { useState } from "react";

interface PrintStepProps {
  showOriginalPrice: boolean;
  setShowOriginalPrice: (val: boolean) => void;
  showBarcode: boolean;
  setShowBarcode: (val: boolean) => void;
  selectedTemplate: string;
  onPrintComplete?: () => void;
}

const TEMPLATE_STYLES: Record<
  string,
  {
    badge: string;
    color: string;
    bgClass: string;
    textClass: string;
    badgeClass: string;
  }
> = {
  standard: {
    badge: "EVERYDAY LOW",
    color: "red",
    bgClass: "bg-zinc-50 border-gray-100",
    textClass: "text-red-600",
    badgeClass: "bg-red-600 text-white",
  },
  promo: {
    badge: "BIG PROMO",
    color: "green",
    bgClass: "bg-zinc-50 border-gray-100",
    textClass: "text-green-600",
    badgeClass: "bg-green-600 text-white",
  },
  clearance: {
    badge: "CLEARANCE",
    color: "yellow",
    bgClass: "bg-zinc-50 border-gray-100",
    textClass: "text-amber-600",
    badgeClass: "bg-amber-500 text-black",
  },
  minimal: {
    badge: "SPECIAL",
    color: "outline",
    bgClass: "bg-white border-2 border-zinc-950",
    textClass: "text-zinc-950",
    badgeClass: "border border-zinc-950 text-zinc-950 bg-white",
  },
};

export default function PrintStep({
  showOriginalPrice,
  setShowOriginalPrice,
  showBarcode,
  setShowBarcode,
  selectedTemplate,
  onPrintComplete,
}: PrintStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setProgress(0);
    setIsDone(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setIsDone(true);
          onPrintComplete?.();
          // Auto reset success status after 3 seconds
          setTimeout(() => setIsDone(false), 3000);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const style = TEMPLATE_STYLES[selectedTemplate] || TEMPLATE_STYLES.standard;

  return (
    <div className="w-full max-w-3xl flex flex-col md:flex-row gap-8 items-center md:items-stretch">
      {/* Print controls column */}
      <div className="flex-1 flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-white text-xl font-bold mb-4">Print Configuration</h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Fine-tune your layout settings. Review the generated PDF file before printing directly.
          </p>

          <div className="space-y-4">
            {/* Show Original Price Toggle */}
            <label className="flex items-center gap-3 cursor-pointer text-zinc-300 hover:text-white transition-colors select-none">
              <input
                type="checkbox"
                checked={showOriginalPrice}
                onChange={(e) => setShowOriginalPrice(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-800 bg-[#0c0e12] text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
              />
              <span>Show original strikethrough price</span>
            </label>

            {/* Show Barcode Toggle */}
            <label className="flex items-center gap-3 cursor-pointer text-zinc-300 hover:text-white transition-colors select-none">
              <input
                type="checkbox"
                checked={showBarcode}
                onChange={(e) => setShowBarcode(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-800 bg-[#0c0e12] text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
              />
              <span>Print barcodes on labels</span>
            </label>
          </div>
        </div>

        <div className="pt-4 relative">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className={`w-full py-3.5 rounded-lg active:scale-95 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer border-0 relative overflow-hidden ${
              isDone
                ? "bg-emerald-600 hover:bg-emerald-700"
                : isGenerating
                ? "bg-zinc-800 text-zinc-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isGenerating && (
              <div
                className="absolute left-0 top-0 bottom-0 bg-emerald-700/40 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            )}
            
            {!isGenerating && !isDone && (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Generate & Download PDF</span>
              </>
            )}

            {isGenerating && (
              <span className="relative z-10">Generating tag sheet ({progress}%)...</span>
            )}

            {isDone && (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>PDF Downloaded (Simulated)</span>
              </>
            )}
          </button>
          
          <div className="text-[10px] text-zinc-500 text-center mt-2 font-medium italic">
            Note: This is an interactive demo showcasing professional tag sheet layouts.
          </div>
        </div>
      </div>

      {/* Print sheet preview mockup */}
      <div className="w-full md:w-[45%] flex justify-center bg-[#13171f]/40 border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden min-h-[300px]">
        <div className="w-full bg-white rounded shadow-inner p-4 text-gray-800 text-left flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">A4 Tag Sheet Preview</span>
            <span className="text-[9px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 font-semibold">10 Tags / Sheet</span>
          </div>

          <div className="grid grid-cols-2 gap-2 flex-1 my-4 overflow-y-auto max-h-[200px] pr-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`rounded p-2 text-left flex flex-col justify-between border ${style.bgClass}`}>
                <div>
                  <span className={`text-[6px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wide inline-block ${style.badgeClass}`}>
                    {style.badge}
                  </span>
                  {showOriginalPrice && (
                    <p className="text-[7px] text-gray-400 line-through mt-1.5">29.99$</p>
                  )}
                  <p className={`${style.textClass} text-xs font-black mt-0.5`}>19.99$</p>
                  <p className="text-[7px] text-gray-700 leading-tight mt-1 truncate font-semibold">Arroz Longo Dourado</p>
                </div>
                {showBarcode && (
                  <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-dashed border-gray-200/60 justify-between">
                    {/* Mock barcode lines */}
                    <div className="flex gap-[1px] h-3 items-end">
                      <div className="w-[1px] h-full bg-black" />
                      <div className="w-[2px] h-full bg-black" />
                      <div className="w-[1px] h-[80%] bg-black" />
                      <div className="w-[1px] h-full bg-black" />
                      <div className="w-[3px] h-[85%] bg-black" />
                      <div className="w-[1px] h-full bg-black" />
                    </div>
                    <div className="w-3.5 h-3.5 rounded-full bg-red-600 shrink-0" style={{ backgroundColor: style.color === 'green' ? '#10B981' : style.color === 'yellow' ? '#F59E0B' : style.color === 'outline' ? '#1F2937' : '#EF4444' }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center text-[8px] text-gray-400 pt-1.5 border-t border-gray-100 font-medium">
            Dynamic Template Preview
          </div>
        </div>
      </div>
    </div>
  );
}
