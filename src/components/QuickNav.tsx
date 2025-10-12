"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function QuickNav() {
  const [theme, setTheme] = useState<"theme-light" | "theme-dark" | "theme-royale">("theme-royale");

  // Apply theme class to <html>
  useEffect(() => {
    const saved = (typeof window !== "undefined" && (localStorage.getItem("theme") as any)) || "theme-royale";
    setTheme(saved === "theme-light" || saved === "theme-dark" || saved === "theme-royale" ? saved : "theme-royale");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    html.classList.remove("theme-light", "theme-dark", "theme-royale");
    html.classList.add(theme);
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);

  const cycleTheme = () => {
    setTheme((t) => (t === "theme-light" ? "theme-dark" : t === "theme-dark" ? "theme-royale" : "theme-light"));
  };

  return (
    <div className="flex items-center justify-center gap-4">
        {/* People icon -> About section (anchor) */}
        <Link
          href="#about"
          aria-label="About"
          className="inline-flex items-center justify-center rounded-2xl active:translate-y-0.5 transition cr-glass-hover"
          style={{
            width: 64,
            height: 64,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "linear-gradient(180deg, #1e2a4d 0%, #0f1a3a 60%, #0b1530 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 10px 18px -12px rgba(0,0,0,0.6)",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 6.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" fill="white"/>
            <path d="M6 18.5c0-3.3137 2.6863-6 6-6s6 2.6863 6 6" fill="white" opacity=".9"/>
          </svg>
        </Link>
        {/* Theme toggle: cycles Light -> Dark -> Royale */}
        <button
          type="button"
          aria-label="Toggle theme"
          title={`Theme: ${theme.replace("theme-", "")}`}
          onClick={cycleTheme}
          className="inline-flex items-center justify-center rounded-2xl active:translate-y-0.5 transition cr-glass-hover"
          style={{
            width: 64,
            height: 64,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "linear-gradient(180deg, #1e2a4d 0%, #0f1a3a 60%, #0b1530 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 10px 18px -12px rgba(0,0,0,0.6)",
          }}
        >
          {/* icon changes slightly per theme */}
          {theme === "theme-light" && (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" fill="#ffd54a"/>
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="#ffd54a" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          )}
          {theme === "theme-dark" && (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M21 12.5A9 9 0 0 1 11.5 3 7 7 0 1 0 21 12.5Z" fill="#cbd5e1"/>
            </svg>
          )}
          {theme === "theme-royale" && (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 9 8 6l4 3 4-3 3 3v9H5V9Z" fill="#f2c94c"/>
              <path d="M7 18h10" stroke="#0b1530" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>
        {/* Resume card icon */}
        <a
          href="/resume.pdf"
          aria-label="Resume"
          className="inline-flex items-center justify-center rounded-2xl active:translate-y-0.5 transition cr-glass-hover"
          style={{
            width: 64,
            height: 64,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "linear-gradient(180deg, #1e2a4d 0%, #0f1a3a 60%, #0b1530 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 10px 18px -12px rgba(0,0,0,0.6)",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="5" y="4" width="14" height="16" rx="2" fill="#7cb3ff"/>
            <rect x="7" y="8" width="10" height="1.8" rx="0.9" fill="#1a3b7a"/>
            <rect x="7" y="11" width="10" height="1.8" rx="0.9" fill="#1a3b7a" opacity=".9"/>
            <rect x="7" y="14" width="6" height="1.8" rx="0.9" fill="#1a3b7a" opacity=".7"/>
            <path d="M9 6h6l-1 1.6h-4L9 6Z" fill="#1a3b7a"/>
          </svg>
        </a>
        {/* Menu icon -> Projects section (anchor) */}
        <Link
          href="#projects"
          aria-label="Projects"
          className="inline-flex items-center justify-center rounded-2xl active:translate-y-0.5 transition cr-glass-hover"
          style={{
            width: 64,
            height: 64,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "linear-gradient(180deg, #1e2a4d 0%, #0f1a3a 60%, #0b1530 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 10px 18px -12px rgba(0,0,0,0.6)",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="5.5" y="7" width="13" height="2.4" rx="1.2" fill="white"/>
            <rect x="5.5" y="11" width="13" height="2.4" rx="1.2" fill="white" opacity=".9"/>
            <rect x="5.5" y="15" width="13" height="2.4" rx="1.2" fill="white" opacity=".8"/>
          </svg>
        </Link>
    </div>
  );
}
