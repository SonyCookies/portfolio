"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const LOCAL_KEY = "siteTheme";
const SESSION_KEY = "themeSelectedThisSession";

export default function ThemeSelectorOverlay() {
  const [show, setShow] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Politeness check: only show if they haven't chosen in this browser session
    try {
      const selectedThisSession = sessionStorage.getItem(SESSION_KEY);
      if (!selectedThisSession) {
        setShow(true);
      }
    } catch {
      setShow(true);
    }
  }, []);

  const selectTheme = (theme: "royale" | "spiderman") => {
    if (typeof document === "undefined") return;
    
    // Begin fade-out sequence
    setIsFadingOut(true);
    
    setTimeout(() => {
      const body = document.body;
      if (theme === "spiderman") {
        body.classList.add("theme-spiderman");
      } else {
        body.classList.remove("theme-spiderman");
      }

      // Persist values in storage
      try {
        localStorage.setItem(LOCAL_KEY, theme);
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch {}

      setShow(false);
    }, 600); // match animation duration
  };

  if (!isMounted || !show) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose Your Arena"
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-lg bg-black/85"
      style={{
        opacity: isFadingOut ? 0 : 1,
        transition: "opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: isFadingOut ? "none" : "auto",
      }}
    >
      {/* Background ambient glowing spotlights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-[10%] left-[-10%] w-[60%] h-[80%] rounded-full blur-[140px] opacity-[0.14] bg-[#f2c94c]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[80%] rounded-full blur-[140px] opacity-[0.14] bg-[#ef4444]" />
      </div>

      {/* Header Container */}
      <div className="relative z-10 text-center mb-6 sm:mb-10 max-w-xl animate-in fade-in slide-in-from-top-6 duration-700">
        <h2
          className="text-2xl sm:text-4xl md:text-5xl font-black tracking-wider uppercase text-white"
          style={{
            letterSpacing: 2,
            textShadow: "0 4px 12px rgba(0,0,0,0.8), 0 0 15px rgba(255,255,255,0.15)",
          }}
        >
          Select Your Universe
        </h2>
        <p className="text-white/60 text-xs sm:text-sm md:text-base mt-2 font-medium tracking-wide">
          Your portfolio arena is ready. Which mode do you wish to enter?
        </p>
      </div>

      {/* Main Grid containing the 2 Gateway Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 w-full max-w-4xl px-2 sm:px-6">
        
        {/* ==================== CLASH ROYALE CARD ==================== */}
        <div
          onClick={() => selectTheme("royale")}
          className="relative rounded-[24px] p-6 flex flex-col justify-between items-center text-center cursor-pointer select-none group transition-all duration-500 overflow-hidden active:scale-98 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100"
          style={{
            minHeight: 380,
            border: "2px solid #f2c94c",
            background: "linear-gradient(180deg, #111a3e 0%, #080d24 100%)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.55), inset 0 2px 0 rgba(255,255,255,0.08)",
          }}
        >
          {/* Speckled background textures */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.1)_0_2px,transparent_2px_10px)]" />
          <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(242,201,76,0.08),transparent_65%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Golden outline hover scan */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[22px] border border-white/20 pointer-events-none" />

          {/* Card Title Banner */}
          <div
            className="w-full py-2.5 rounded-xl font-black text-xs sm:text-sm tracking-widest uppercase text-black"
            style={{
              background: "linear-gradient(180deg, #f2c94c 0%, #d9a800 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 10px rgba(0,0,0,0.35)",
            }}
          >
            King's Arena
          </div>

          {/* Animated 3D Graphic Area */}
          <div className="relative my-6 flex items-center justify-center w-full h-32">
            {/* Soft backdrop halo */}
            <div className="absolute w-28 h-28 rounded-full bg-[#f2c94c]/10 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-110" />
            
            {/* Trophy SVG */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-24 h-24 sm:w-28 sm:h-28 text-[#f2c94c] filter drop-shadow-[0_4px_10px_rgba(242,201,76,0.35)] transition-transform duration-500 group-hover:scale-108 group-hover:rotate-[-4deg]"
            >
              <path d="M5 2h14v2H5V2Zm2 4h10v6a5 5 0 0 1-5 5 5 5 0 0 1-5-5V6Zm-3 1h2v4H4V7Zm14 0h2v4h-2V7ZM12 18h-2v3H8v1h8v-1h-2v-3h-2Z" fill="currentColor" />
              <circle cx="12" cy="10" r="1.5" fill="#111a3e" />
            </svg>

            {/* Micro floating sparkles */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute top-[20%] left-[25%] w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping" />
              <div className="absolute bottom-[25%] right-[25%] w-2 h-2 bg-yellow-200 rounded-full animate-ping" style={{ animationDelay: "200ms" }} />
            </div>
          </div>

          {/* Summary Box */}
          <div className="px-2">
            <h3 className="text-white text-base sm:text-lg font-black tracking-wide uppercase">Clash Royale Theme</h3>
            <p className="text-white/60 text-[11px] sm:text-xs leading-relaxed mt-1 max-w-[240px] mx-auto">
              Original theme featuring medieval gold quilt backdrops, Job Title badges, and responsive companion pets.
            </p>
          </div>

          {/* Golden Choice Button */}
          <button
            type="button"
            className="w-full mt-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm tracking-wider uppercase text-black active:translate-y-0.5 transition shadow-lg pointer-events-none"
            style={{
              border: "1px solid #cfa313",
              background: "linear-gradient(180deg, #f2c94c 0%, #d9a800 100%)",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.4), 0 6px 14px rgba(0,0,0,0.35)",
            }}
          >
            Choose Royale
          </button>
        </div>

        {/* ==================== SPIDER-MAN CARD ==================== */}
        <div
          onClick={() => selectTheme("spiderman")}
          className="relative rounded-[24px] p-6 flex flex-col justify-between items-center text-center cursor-pointer select-none group transition-all duration-500 overflow-hidden active:scale-98 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200"
          style={{
            minHeight: 380,
            border: "2px solid #ef4444",
            background: "linear-gradient(180deg, #040814 0%, #091129 100%)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.55), inset 0 2px 0 rgba(255,255,255,0.08)",
          }}
        >
          {/* Carbon hexagonal mesh grid and Spidey Web Spoke layers */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.1]"
            style={{
              backgroundImage: `
                radial-gradient(circle at center, rgba(239,68,68,0.15) 30%, transparent 32%),
                radial-gradient(circle, rgba(0,0,0,0.4) 24%, transparent 26%)
              `,
              backgroundSize: "100% 100%, 8px 8px",
            }}
          />
          <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.08),transparent_65%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Crimson outline hover scan */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[22px] border border-white/20 pointer-events-none" />

          {/* Card Title Banner */}
          <div
            className="w-full py-2.5 rounded-xl font-black text-xs sm:text-sm tracking-widest uppercase text-white"
            style={{
              background: "linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 10px rgba(0,0,0,0.35)",
            }}
          >
            Web-Slinger's Realm
          </div>

          {/* Animated 3D Graphic Area */}
          <div className="relative my-6 flex items-center justify-center w-full h-32">
            {/* Soft backdrop halo */}
            <div className="absolute w-28 h-28 rounded-full bg-[#ef4444]/10 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-110" />

            {/* Glowing Spider Badge SVG */}
            <svg
              viewBox="0 0 24 24"
              fill="white"
              className="w-24 h-24 sm:w-28 sm:h-28 text-white filter drop-shadow-[0_0_12px_rgba(239,68,68,0.7)] transition-transform duration-500 group-hover:scale-108 group-hover:rotate-[4deg]"
            >
              <ellipse cx="12" cy="12" rx="2.5" ry="3.5" />
              <circle cx="12" cy="7" r="1.6" />
              <path d="M10.5 11c-2.5-1-4.5-3-5-6M10.5 12.5c-3 .5-5 .5-6-2.5M10.5 13.5c-2.5 1.5-4.5 3.5-4 7M10.5 14.5c-1.5 2-2.5 4.5-1.5 7" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M13.5 11c2.5-1 4.5-3 5-6M13.5 12.5c3 .5 5 .5 6-2.5M13.5 13.5c2.5 1.5 4.5 3.5 4 7M13.5 14.5c1.5 2-2.5 4.5 1.5 7" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            </svg>

            {/* Micro thin web overlays inside Card hover area */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-8 h-8 text-white/30">
                <path d="M0,0 L0,20 C8,16 16,8 20,0 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
              </svg>
              <svg viewBox="0 0 100 100" className="absolute bottom-0 right-0 w-8 h-8 text-white/30 transform rotate-180">
                <path d="M0,0 L0,20 C8,16 16,8 20,0 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
              </svg>
            </div>
          </div>

          {/* Summary Box */}
          <div className="px-2">
            <h3 className="text-white text-base sm:text-lg font-black tracking-wide uppercase">Spider-Man Theme</h3>
            <p className="text-white/60 text-[11px] sm:text-xs leading-relaxed mt-1 max-w-[240px] mx-auto">
              Immersive gateway featuring full concentric background webs, Stark vaults, web-strand timelines, and witty tagalog companion quotes.
            </p>
          </div>

          {/* Spidey Choice Button */}
          <button
            type="button"
            className="w-full mt-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm tracking-wider uppercase text-white active:translate-y-0.5 transition shadow-lg pointer-events-none"
            style={{
              border: "1px solid #b91c1c",
              background: "linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.35), 0 6px 14px rgba(239,68,68,0.25)",
            }}
          >
            Choose Spidey
          </button>
        </div>

      </div>
    </div>
  );
}
