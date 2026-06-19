"use client";

import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  type = "info",
}: ConfirmModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      iconBg: "bg-red-950/40 text-red-500 border border-red-900/30",
      btnClass: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-900",
      accentBorder: "border-t-4 border-t-red-600",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
    warning: {
      iconBg: "bg-amber-950/40 text-amber-500 border border-amber-900/30",
      btnClass: "bg-amber-500 hover:bg-amber-600 text-black font-bold focus:ring-amber-900",
      accentBorder: "border-t-4 border-t-amber-500",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      ),
    },
    info: {
      iconBg: "bg-blue-950/40 text-blue-500 border border-blue-900/30",
      btnClass: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-900",
      accentBorder: "border-t-4 border-t-blue-600",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const style = typeStyles[type];

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in select-none"
    >
      {/* Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking card content
        className={`relative w-full max-w-md bg-[#0d1017] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl transition-transform animate-scale-up ${style.accentBorder}`}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <span className={`p-2.5 rounded-full shrink-0 ${style.iconBg}`}>
              {style.icon}
            </span>

            {/* Content */}
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold text-white tracking-tight leading-snug">
                {title}
              </h3>
              <p className="text-zinc-400 text-[10px] leading-relaxed font-semibold">
                {message}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-zinc-900/80">
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-2 text-[10px] font-bold text-zinc-400 border border-zinc-800 bg-[#161b22] hover:bg-[#21262d] hover:text-white rounded-lg transition-all cursor-pointer active:scale-95"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-3.5 py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0d1017] ${style.btnClass}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
