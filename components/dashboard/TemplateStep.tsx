"use client";

interface Template {
  id: string;
  name: string;
  desc: string;
  badge: string;
  color: "red" | "green" | "yellow";
}

interface TemplateStepProps {
  templates: Template[];
  selectedTemplate: string;
  setSelectedTemplate: (id: string) => void;
}

export default function TemplateStep({
  templates,
  selectedTemplate,
  setSelectedTemplate,
}: TemplateStepProps) {
  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="text-white text-xl font-bold mb-6">Select A Retail Tag Template</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full">
        {templates.map((tmpl) => (
          <div
            key={tmpl.id}
            onClick={() => setSelectedTemplate(tmpl.id)}
            className={`relative rounded-xl p-4 bg-[#121620]/30 border transition-all cursor-pointer flex flex-col justify-between h-56 shadow-md select-none ${
              selectedTemplate === tmpl.id
                ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-[#121620]/50"
                : "border-zinc-800 hover:border-zinc-700/80 hover:bg-[#121620]/40"
            }`}
          >
            {/* Checkmark overlay for active state */}
            {selectedTemplate === tmpl.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Mock Tag layout preview */}
            <div className="bg-white rounded-lg p-2.5 w-full border border-gray-200 text-left">
              <span className={`inline-block text-[7px] font-bold text-white px-1.5 py-0.5 rounded-sm ${
                tmpl.color === "green" ? "bg-green-600" : tmpl.color === "yellow" ? "bg-amber-500" : "bg-red-600"
              }`}>
                {tmpl.badge}
              </span>
              <div className="flex items-baseline gap-0.5 mt-1">
                <span className="text-red-600 text-sm font-extrabold">12.99</span>
                <span className="text-red-600 text-[8px] font-bold">$</span>
              </div>
              <div className="h-1 bg-gray-200 rounded-sm w-3/4 mt-2" />
              <div className="h-1 bg-gray-200 rounded-sm w-1/2 mt-1" />
            </div>

            {/* Info details */}
            <div className="mt-3">
              <p className="text-white text-sm font-semibold text-left">{tmpl.name}</p>
              <p className="text-zinc-500 text-[10px] text-left leading-tight mt-1">
                {tmpl.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
