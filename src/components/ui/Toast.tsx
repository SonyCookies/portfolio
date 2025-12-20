"use client";
import { useEffect, useState } from "react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "loading";
  progress?: number;
}

let toastId = 0;
const toastListeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

function notify() {
  toastListeners.forEach((listener) => listener([...toasts]));
}

export function showToast(message: string, type: Toast["type"] = "info", progress?: number): string {
  const id = `toast-${++toastId}`;
  const toast: Toast = { id, message, type, progress };
  toasts = [...toasts, toast];
  notify();

  if (type !== "loading") {
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }

  return id;
}

export function updateToast(id: string, updates: Partial<Toast>) {
  const toast = toasts.find((t) => t.id === id);
  if (!toast) return;
  
  const wasLoading = toast.type === "loading";
  const updatedToast = { ...toast, ...updates };
  const isNowNonLoading = updatedToast.type !== "loading" && wasLoading;
  
  toasts = toasts.map((t) => (t.id === id ? updatedToast : t));
  notify();
  
  // If toast was updated from "loading" to a non-loading type, auto-dismiss after 3 seconds
  if (isNowNonLoading) {
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }
}

export function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export function useToasts() {
  const [state, setState] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setState(newToasts);
    toastListeners.push(listener);
    setState([...toasts]);

    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, []);

  return state;
}

export default function ToastContainer() {
  const toasts = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[300] flex flex-col gap-2 items-end">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="min-w-[320px] max-w-[90vw] rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm"
          style={{
            background:
              toast.type === "success"
                ? "linear-gradient(180deg, #10b981 0%, #059669 100%)"
                : toast.type === "error"
                ? "linear-gradient(180deg, #ef4444 0%, #dc2626 100%)"
                : toast.type === "loading"
                ? "linear-gradient(180deg, #808a99 0%, #6b7586 100%)"
                : "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 100%)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <div className="flex items-center gap-3">
            {toast.type === "loading" && (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
            )}
            {toast.type === "success" && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {toast.type === "error" && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold">{toast.message}</p>
              {toast.type === "loading" && toast.progress !== undefined && (
                <div className="mt-2 w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-300 rounded-full"
                    style={{ width: `${toast.progress}%` }}
                  />
                </div>
              )}
            </div>
            {toast.type !== "loading" && (
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/80 hover:text-white transition-colors shrink-0"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

