"use client";

interface StepHeaderProps {
  currentStep: 1 | 2 | 3;
  setCurrentStep: (step: 1 | 2 | 3) => void;
}

export default function StepHeader({ currentStep, setCurrentStep }: StepHeaderProps) {
  return (
    <div className="w-full max-w-2xl flex justify-between items-center mb-16 relative">
      {/* Background line */}
      <div className="absolute left-0 right-0 bottom-[2px] h-[1px] bg-zinc-855 bg-zinc-800 z-0" />
      
      {/* Step 1: Import List */}
      <button
        type="button"
        onClick={() => setCurrentStep(1)}
        className={`flex-1 pb-3 text-center z-10 font-semibold text-sm transition-all border-b-[3px] cursor-pointer ${
          currentStep === 1
            ? "text-white border-emerald-500"
            : "text-zinc-500 border-transparent hover:text-zinc-300"
        }`}
      >
        Import List
      </button>
      
      {/* Step 2: Pick Template */}
      <button
        type="button"
        onClick={() => setCurrentStep(2)}
        className={`flex-1 pb-3 text-center z-10 font-semibold text-sm transition-all border-b-[3px] cursor-pointer ${
          currentStep === 2
            ? "text-white border-emerald-500"
            : "text-zinc-500 border-transparent hover:text-zinc-300"
        }`}
      >
        Pick Template
      </button>
      
      {/* Step 3: Print Tags */}
      <button
        type="button"
        onClick={() => setCurrentStep(3)}
        className={`flex-1 pb-3 text-center z-10 font-semibold text-sm transition-all border-b-[3px] cursor-pointer ${
          currentStep === 3
            ? "text-white border-emerald-500"
            : "text-zinc-500 border-transparent hover:text-zinc-300"
        }`}
      >
        Print Tags
      </button>
    </div>
  );
}
