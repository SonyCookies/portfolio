"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "fontTheme"; // 'clash' | 'default'

export default function FontToggleFab() {
  const [isDefault, setIsDefault] = useState<boolean>(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const shouldDefault = saved === "default";
      setIsDefault(shouldDefault);
      applyClass(shouldDefault);
    } catch {}
  }, []);

  const applyClass = (useDefault: boolean) => {
    if (typeof document === "undefined") return;
    const body = document.body;
    if (useDefault) {
      body.classList.add("font-default");
    } else {
      body.classList.remove("font-default");
    }
  };

  const toggle = () => {
    const next = !isDefault;
    setIsDefault(next);
    applyClass(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "default" : "clash");
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDefault ? "Switch to Clash font" : "Switch to Default font"}
      title={isDefault ? "Use Clash font" : "Use Default font"}
      className="fixed bottom-6 right-6 z-50 grid place-items-center rounded-full shadow-lg active:translate-y-0.5 transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
      style={{
        width: 52,
        height: 52,
        background:
          isDefault
            ? "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)"
            : "linear-gradient(180deg, #a855f7 10%, #7c3aed 55%, #6d28d9 100%)",
        border: "1px solid rgba(255,255,255,0.25)",
        boxShadow:
          "0 10px 20px -10px rgba(0,0,0,0.55), inset 0 2px 0 rgba(255,255,255,0.35)",
      }}
    >
      <span
        className={`${isDefault ? "font-sans" : "clash-font"} text-white text-lg font-extrabold`}
        style={{ textShadow: "0 1px 0 rgba(0,0,0,0.35)" }}
      >
        Aa
      </span>
    </button>
  );
}
