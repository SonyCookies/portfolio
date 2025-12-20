"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import type React from "react";
import Card from "@/components/ui/Card";
import { getHeroData, type HeroData } from "@/lib/hero-data";

export default function Hero() {
  const [showReveal, setShowReveal] = useState(false);
  const [revealVars, setRevealVars] = useState<{ x: number; y: number; scale: number; rot: number } | null>(null);
  const avatarRef = useRef<HTMLButtonElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [revealPhase, setRevealPhase] = useState<"legend" | "profile">("legend");
  const [isCentered, setIsCentered] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const phaseTimeoutRef = useRef<number | null>(null);
  const spinStartRef = useRef<number | null>(null);
  
  // Hero data from Firestore
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load hero data from Firestore
  useEffect(() => {
    const loadHeroData = async () => {
      try {
        const data = await getHeroData();
        setHeroData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading hero data:", error);
        setLoading(false);
      }
    };
    loadHeroData();
  }, []);

  const openResume = (e?: React.MouseEvent<HTMLAnchorElement>) => {
    e?.preventDefault();
    if (heroData?.resumeUrl) {
      const newTab = window.open(heroData.resumeUrl, "_blank");
      newTab?.focus();
    }
  };

  useEffect(() => {
    if (!showReveal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeReveal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showReveal]);

  useEffect(() => {
    if (!showReveal || !cardRef.current) return;
    // Add final class on the next frame so the browser paints the initial transform first
    const id = requestAnimationFrame(() => {
      cardRef.current?.classList.add("cr-reveal-final");
    });
    return () => cancelAnimationFrame(id);
  }, [showReveal]);

  // Start spin only after the FLIP translation to center (~720ms)
  useEffect(() => {
    if (!showReveal) return;
    // ensure no spin initially
    wrapperRef.current?.classList.remove("cr-flip-easeout");
    setIsCentered(false);
    // schedule spin to begin after translation settles
    if (spinStartRef.current) {
      clearTimeout(spinStartRef.current);
      spinStartRef.current = null;
    }
    spinStartRef.current = window.setTimeout(() => {
      // guard if closed meanwhile
      if (!showReveal) return;
      setIsCentered(true);
      wrapperRef.current?.classList.add("cr-flip-easeout");
    }, 800);
    return () => {
      if (spinStartRef.current) {
        clearTimeout(spinStartRef.current);
        spinStartRef.current = null;
      }
    };
  }, [showReveal]);

  // Swap legendary image to profile after spin completes
  useEffect(() => {
    if (!showReveal) return;
    // start with legendary, then reveal profile after spin (~0.8s center + 5s spin)
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
    if (revealPhase === "legend") {
      phaseTimeoutRef.current = window.setTimeout(() => {
        setRevealPhase("profile");
        setCelebrate(true);
        window.setTimeout(() => setCelebrate(false), 1200);
      }, 4200);
    }
    return () => {
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current);
        phaseTimeoutRef.current = null;
      }
    };
  }, [showReveal, revealPhase]);

  const closeReveal = () => {
    // play reverse: remove final class to go back to initial transform
    cardRef.current?.classList.remove("cr-reveal-final");
    // stop wrapper animation immediately
    wrapperRef.current?.classList.remove("cr-flip-easeout");
    if (spinStartRef.current) {
      clearTimeout(spinStartRef.current);
      spinStartRef.current = null;
    }
    // clear legend->profile swap timer and reset
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
    setRevealPhase("legend");
    // allow transition to complete before unmount, then update avatar to real photo
    window.setTimeout(() => { setShowReveal(false); setHasRevealed(true); }, 750);
    setCelebrate(false);
  };

  const openReveal = () => {
    // ensure initial state
    cardRef.current?.classList.remove("cr-reveal-final");
    setRevealPhase("legend");
    setIsCentered(false);
    const targetW = 280;
    const targetH = 360;
    const rect = avatarRef.current?.getBoundingClientRect();
    if (rect) {
      const scale = Math.min(rect.width / targetW, rect.height / targetH);
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // translate from avatar position TO center -> initial transform moves card over avatar
      const tx = cx - window.innerWidth / 2;
      const ty = cy - window.innerHeight / 2;
      setRevealVars({ x: tx, y: ty, scale, rot: -18 });
    } else {
      setRevealVars({ x: 0, y: 0, scale: 0.4, rot: -18 });
    }
    setShowReveal(true);
  };

  // Show loading state if data not loaded (AFTER all hooks)
  if (loading || !heroData) {
    return (
      <Card borderless className="col-span-full lg:col-span-7 xl:col-span-8">
        <div
          className="relative overflow-hidden rounded-tl-xl rounded-tr-none rounded-br-xl rounded-bl-xl"
          style={{
            background: "transparent",
            borderTop: "1px solid rgba(255,255,255,0.16)",
            borderLeft: "1px solid rgba(255,255,255,0.16)",
            borderBottom: "1px solid rgba(255,255,255,0.16)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.35), 0 14px 30px -18px rgba(0,0,0,0.6)",
          }}
        >
          {/* Banner Skeleton */}
          <div className="relative h-48 sm:h-44 bg-gradient-to-r from-[#1e2a4d] via-[#2a3d6b] to-[#1e2a4d] animate-pulse">
            <div className="absolute -bottom-6 left-2 sm:left-3 md:left-6 size-32 sm:size-36 md:size-40 rounded-2xl bg-gradient-to-br from-[#2a3d6b] to-[#1e2a4d] border-2 border-white/20 animate-pulse" style={{
              boxShadow: "0 14px 28px -16px rgba(0,0,0,0.65)",
            }} />
          </div>

          {/* Content Skeleton */}
          <div
            className="relative z-10 px-4 pt-6 pb-3"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in oklab, #0f214a 60%, #0a1634 40%), color-mix(in oklab, #112956 70%, #0b1736 30%))",
              borderTop: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                {/* Name Skeleton */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-48 bg-white/10 rounded-md animate-pulse" />
                  <div className="h-5 w-7 bg-white/10 rounded animate-pulse" />
                </div>
                {/* Location Skeleton */}
                <div className="mt-2 flex items-start gap-2 mb-3">
                  <div className="h-5 w-5 bg-white/10 rounded-full animate-pulse mt-0.5" />
                  <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
                </div>
                {/* Job Title Skeleton */}
                <div className="h-8 w-36 bg-white/10 rounded-md animate-pulse" />
              </div>
              {/* Buttons Skeleton */}
              <div className="ml-3 shrink-0 grid gap-2 text-sm">
                <div className="hidden sm:grid gap-2">
                  <div className="h-9 w-28 bg-white/10 rounded-md animate-pulse" />
                  <div className="h-9 w-32 bg-white/10 rounded-md animate-pulse" />
                </div>
                <div className="flex flex-col items-center gap-2 sm:hidden">
                  <div className="h-10 w-10 bg-white/10 rounded-full animate-pulse" />
                  <div className="h-10 w-10 bg-white/10 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // TypeScript now knows heroData is not null after the check above
  const data = heroData;

  return (
    <Card borderless className="col-span-full lg:col-span-7 xl:col-span-8">
      <div
        className="relative overflow-hidden rounded-tl-xl rounded-tr-none rounded-br-xl rounded-bl-xl"
        style={{
          background: "transparent",
          borderTop: "1px solid rgba(255,255,255,0.16)",
          borderLeft: "1px solid rgba(255,255,255,0.16)",
          borderBottom: "1px solid rgba(255,255,255,0.16)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.35), 0 14px 30px -18px rgba(0,0,0,0.6)",
        }}
      >
        <div className="relative h-48 sm:h-44">
          <Image src={data.bannerImage} alt="Banner background" fill className="object-cover object-right sm:object-center" priority />
          {/* overlay removed for full transparency */}
          <button
            ref={avatarRef}
            onClick={openReveal}
            aria-label="Reveal Profile"
            className={`absolute -bottom-6 left-2 sm:left-3 md:left-6 size-32 sm:size-36 md:size-40 rounded-2xl overflow-hidden border rotate-2 z-20 focus:outline-none focus:ring-2 focus:ring-yellow-400 cr-glass-hover ${!hasRevealed ? 'cr-tempt-bob cr-tempt-glow cr-tempt-shimmer' : ''}`}
            style={{
              borderColor: "color-mix(in oklab, var(--accent) 45%, white 8%)",
              borderWidth: 2,
              boxShadow: "0 0 0 2px color-mix(in oklab, var(--cr-blue) 40%, #0a1634 60%), 0 14px 28px -16px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.35)",
            }}
          >
            {!hasRevealed && (
              <div aria-hidden className="pointer-events-none absolute -inset-1 cr-tempt-ping" />
            )}
            {hasRevealed ? (
              <Image src={data.profilePhoto} alt="Profile photo" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0">
                {/* purple base */}
                <div className="absolute inset-0 grid place-items-center" style={{
                  background: "linear-gradient(180deg, #a855f7 10%, #7c3aed 55%, #6d28d9 100%)",
                  boxShadow: "inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 0 rgba(0,0,0,0.45)",
                }}>
                  <span className="clash-font text-white text-4xl sm:text-5xl font-extrabold" style={{ textShadow: "0 2px 0 rgba(0,0,0,0.35)" }}>?</span>
                </div>
                {/* rim glow */}
                <div aria-hidden className="pointer-events-none absolute -inset-0.5 rounded-2xl" style={{
                  boxShadow: "0 0 0 2px rgba(255,255,255,0.2), 0 10px 24px -14px rgba(0,0,0,0.6)",
                }} />
                {/* subtle rays field */}
                <div aria-hidden className="pointer-events-none absolute -inset-2 cr-rayfield cr-ray-pulse" style={{ opacity: 0.7 }} />
                {/* top gloss */}
                <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl" style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 18%, rgba(255,255,255,0.02) 35%, transparent 50%)",
                  mixBlendMode: "screen",
                }} />
              </div>
            )}
          </button>
        </div>

        <div
          className="relative z-10 px-4 pt-6 pb-3"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, #0f214a 60%, #0a1634 40%), color-mix(in oklab, #112956 70%, #0b1736 30%))",
            borderTop: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                  <h1
                    className="truncate text-2xl sm:text-3xl font-extrabold tracking-tight"
                    style={{ textShadow: "0 2px 0 rgba(0,0,0,0.45)" }}
                  >
                    {data.name}
                  </h1>
                <Image src="/cr-crown.svg" alt="Crown" width={28} height={18} className="-translate-y-1" />
              </div>
              <div className="mt-2 flex items-start gap-2 text-white/85 text-xs sm:text-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.314-2.686-6-6-6zm0 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor"/>
                </svg>
                  <span className="">{data.location}</span>
              </div>
              <div
                className="inline-flex items-center rounded-md px-3 py-2 text-white/90 text-sm sm:text-base font-semibold mt-2"
                style={{
                  border: "1px solid color-mix(in oklab, var(--cr-blue) 22%, white 10%)",
                  background:
                    "linear-gradient(180deg, color-mix(in oklab, var(--cr-blue) 20%, transparent), color-mix(in oklab, var(--cr-navy) 65%, #0b1736 35%))",
                }}
                >
                  {data.jobTitle}
                </div>
            </div>
            <div className="ml-3 shrink-0 grid gap-2 text-sm">
              {/* mobile: icon-only circular buttons */}
              <div className="flex flex-col items-center gap-2 sm:hidden">
                <a
                  href={data.resumeUrl}
                  onClick={openResume}
                  aria-label="Open resume"
                  title="Resume"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full active:translate-y-0.5 transition shadow-md cr-glass-hover"
                  style={{
                    width: 40,
                    height: 40,
                    border: "1px solid color-mix(in oklab, var(--accent) 55%, #8f6a12 45%)",
                    background:
                      "linear-gradient(180deg, color-mix(in oklab, var(--accent) 92%, white 6%), color-mix(in oklab, var(--accent) 70%, #b68b1a 30%))",
                    boxShadow: "inset 0 2px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                  }}
                >
                  <Image src="/cr-scroll.svg" alt="Resume" width={18} height={18} />
                </a>
                <a
                  href={`mailto:${data.email}`}
                  aria-label="Send email"
                  title="Send Email"
                  className="inline-flex items-center justify-center rounded-full active:translate-y-0.5 transition shadow-md cr-glass-hover"
                  style={{
                    width: 40,
                    height: 40,
                    border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                    background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                  }}
                >
                  <Image src="/cr-mail.svg" alt="Email" width={18} height={18} />
                </a>
              </div>
              {/* sm+: text buttons */}
              <div className="hidden sm:grid gap-2">
                <a
                  href={data.resumeUrl}
                  onClick={openResume}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 font-extrabold active:translate-y-0.5 transition text-black cr-glass-hover"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    border: "1px solid color-mix(in oklab, var(--accent) 55%, #8f6a12 45%)",
                    background:
                      "linear-gradient(180deg, color-mix(in oklab, var(--accent) 92%, white 6%), color-mix(in oklab, var(--accent) 70%, #b68b1a 30%))",
                    boxShadow: "inset 0 2px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                  }}
                >
                  <Image
                    src="/cr-scroll.svg"
                    alt="Resume"
                    width={20}
                    height={20}
                    className="block"
                    style={{ filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.4))" }}
                  />
                  <span>Resume</span>
                </a>
                <a
                  href={`mailto:${data.email}`}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 font-semibold text-white active:translate-y-0.5 transition cr-glass-hover"
                  style={{
                    border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                    background:
                      "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                  }}
                >
                  <Image
                    src="/cr-mail.svg"
                    alt="Email"
                    width={20}
                    height={20}
                    className="block"
                    style={{ filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.5))" }}
                  />
                  <span>Send Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showReveal && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center"
          onClick={closeReveal}
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 backdrop-blur-sm" style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, rgba(17,24,39,0.8), rgba(2,6,23,0.9))",
          }} />
          {/* corner rays removed in favor of edge scan + orbits */}
          <div ref={wrapperRef} className="relative z-[101] cr-perspective" onClick={(e) => e.stopPropagation()}>
            {/* outside ambience layers (only after centered) */}
            {isCentered && (
              <>
                <div aria-hidden className="absolute -inset-10 cr-aurora" style={{ zIndex: 0 }} />
                <div aria-hidden className="absolute -inset-2 cr-ring" style={{ zIndex: 1 }} />
                <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
                  <div className="cr-mote absolute left-[8%] top-[18%]" />
                  <div className="cr-mote absolute right-[10%] bottom-[14%]" style={{ animationDelay: "400ms" }} />
                  <div className="cr-mote absolute left-[22%] bottom-[28%]" style={{ animationDelay: "900ms" }} />
                </div>
              </>
            )}
            <div
              ref={cardRef}
              className="cr-legend-reveal cr-reveal-card cr-reveal-glow mx-auto overflow-hidden rounded-2xl border z-10"
              style={{
                width: 280,
                height: 360,
                // initial transform from avatar position
                // provided via CSS variables for the FLIP style animation
                ...(revealVars
                  ? ({
                      ["--cr-reveal-x"]: `${revealVars.x}px`,
                      ["--cr-reveal-y"]: `${revealVars.y}px`,
                      ["--cr-reveal-scale"]: `${revealVars.scale}`,
                      ["--cr-reveal-rot"]: `${revealVars.rot}deg`,
                    } as unknown as React.CSSProperties)
                  : {}),
                borderColor: "#000",
                boxShadow:
                  "0 0 0 3px #000, 0 0 0 8px #1a1d2a, inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 0 rgba(0,0,0,0.55), 0 28px 70px rgba(0,0,0,0.6)",
                background:
                  "linear-gradient(180deg, #a855f7 8%, #7c3aed 55%, #6d28d9 100%)",
              }}
            >
              {/* subtle rays while traveling to center */}
              <div aria-hidden className="absolute -inset-4 cr-rayfield" style={{ opacity: 0.35 }} />
              {/* rim glow & rayfield only after centered */}
              {isCentered && (
                <>
                  <div aria-hidden className="absolute -inset-1 cr-rim-glow" />
                  <div aria-hidden className="absolute -inset-4 cr-rayfield cr-ray-pulse" />
                </>
              )}
              {/* edge glow scan + orbiting sparks while centered and in legend phase */}
              {isCentered && revealPhase === "legend" && (
                <>
                  <div aria-hidden className="absolute inset-0 cr-edge-scan" />
                  <div aria-hidden className="cr-orbit r1"><div className="dot" /></div>
                  <div aria-hidden className="cr-orbit r2"><div className="dot" /></div>
                  <div aria-hidden className="cr-orbit r3"><div className="dot" /></div>
                </>
              )}
              {/* inner bevel ring */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-1 rounded-2xl"
                style={{
                  boxShadow:
                    "inset 0 2px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.35)",
                }}
              />
              {/* top gloss */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 18%, rgba(255,255,255,0.02) 35%, transparent 50%)",
                  mixBlendMode: "screen",
                }}
              />
              {/* sparkles after centered */}
              {isCentered && (
                <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
                  <div className="cr-sparkle absolute left-[18%] top-[38%]" />
                  <div className="cr-sparkle absolute right-[14%] bottom-[22%]" style={{ animationDelay: "300ms" }} />
                </div>
              )}
              <div className={`absolute inset-0 grid place-items-center transition-opacity duration-500 ${revealPhase === "legend" ? "opacity-100" : "opacity-0"}`}>
                <span
                  className="clash-font text-white text-8xl sm:text-9xl font-extrabold"
                  style={{
                    textShadow:
                      "0 3px 0 rgba(0,0,0,0.35), 0 0 12px rgba(255,255,255,0.2)",
                  }}
                >
                  ?
                </span>
              </div>
              {/* glass glare sweep once centered */}
              {isCentered && (
                <div aria-hidden className="pointer-events-none absolute inset-0 cr-glare-sweep" />
              )}
              {/* celebration burst on reveal */}
              {celebrate && (
                <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
                  <div className="cr-shockwave absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span
                      key={i}
                      className="cr-confetti absolute left-1/2 top-1/2"
                      style={{
                        ["--tx"]: `${(Math.cos((i / 12) * Math.PI * 2) * (60 + (i % 3) * 18)).toFixed(0)}px`,
                        ["--ty"]: `${(Math.sin((i / 12) * Math.PI * 2) * (-70 - (i % 3) * 16)).toFixed(0)}px`,
                        background: ["#f2c94c", "#ffffff", "#b277ff"][i % 3],
                        animationDelay: `${(i % 4) * 40}ms`,
                      } as unknown as React.CSSProperties}
                    />
                  ))}
                </div>
              )}
              <div className="absolute inset-0">
                <Image
                  src={data.profilePhoto}
                  alt="Profile"
                  fill
                  className={`object-cover transition-opacity duration-500 ${revealPhase === "profile" ? "opacity-100" : "opacity-0"}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
    </Card>
  );
}
