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
  const [isSpidey, setIsSpidey] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const checkTheme = () => {
      setIsSpidey(document.body.classList.contains("theme-spiderman"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [revealPhase, setRevealPhase] = useState<"legend" | "profile">("legend");
  const [isCentered, setIsCentered] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const phaseTimeoutRef = useRef<number | null>(null);
  const spinStartRef = useRef<number | null>(null);

  // Resume option modal state
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeScale, setResumeScale] = useState(0.96);

  useEffect(() => {
    if (!showResumeModal) return;
    setResumeScale(0.96);
    const raf = requestAnimationFrame(() => {
      setResumeScale(1.06);
      const timer = window.setTimeout(() => {
        setResumeScale(1.0);
      }, 120);
      return () => window.clearTimeout(timer);
    });
    return () => cancelAnimationFrame(raf);
  }, [showResumeModal]);

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
    if (heroData?.resumes && heroData.resumes.length > 1) {
      setShowResumeModal(true);
    } else if (heroData?.resumes && heroData.resumes.length === 1) {
      const newTab = window.open(heroData.resumes[0].url, "_blank");
      newTab?.focus();
    } else if (heroData?.resumeUrl) {
      const newTab = window.open(heroData.resumeUrl, "_blank");
      newTab?.focus();
    } else {
      alert("No resume is currently available.");
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
            {isSpidey && (
              <div className="absolute inset-0 pointer-events-none z-30" style={{ opacity: 0.85 }}>
                {/* Top-Left Web overlay */}
                <svg viewBox="0 0 40 40" className="absolute top-0 left-0 w-8 h-8 text-white/50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  <path d="M0,0 L0,25 C10,20 20,10 25,0 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d="M0,8 C4,7 7,4 8,0 M0,16 C8,14 14,8 16,0 M0,24 C12,20 20,12 24,0" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1,1" />
                </svg>
                {/* Top-Right Web overlay */}
                <svg viewBox="0 0 40 40" className="absolute top-0 right-0 w-8 h-8 text-white/50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] transform rotate-90">
                  <path d="M0,0 L0,25 C10,20 20,10 25,0 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d="M0,8 C4,7 7,4 8,0 M0,16 C8,14 14,8 16,0 M0,24 C12,20 20,12 24,0" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1,1" />
                </svg>
                {/* Bottom-Left Web overlay */}
                <svg viewBox="0 0 40 40" className="absolute bottom-0 left-0 w-8 h-8 text-white/50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] transform -rotate-90">
                  <path d="M0,0 L0,25 C10,20 20,10 25,0 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d="M0,8 C4,7 7,4 8,0 M0,16 C8,14 14,8 16,0 M0,24 C12,20 20,12 24,0" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1,1" />
                </svg>
                {/* Bottom-Right Web overlay */}
                <svg viewBox="0 0 40 40" className="absolute bottom-0 right-0 w-8 h-8 text-white/50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] transform rotate-180">
                  <path d="M0,0 L0,25 C10,20 20,10 25,0 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d="M0,8 C4,7 7,4 8,0 M0,16 C8,14 14,8 16,0 M0,24 C12,20 20,12 24,0" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1,1" />
                </svg>
              </div>
            )}
            {!hasRevealed && (
              <div aria-hidden className="pointer-events-none absolute -inset-1 cr-tempt-ping" />
            )}
            {hasRevealed ? (
              <Image src={data.profilePhoto} alt="Profile photo" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0">
                <div className="absolute inset-0 grid place-items-center" style={{
                  background: isSpidey
                    ? "linear-gradient(180deg, #ef4444 10%, #1d4ed8 75%, #040814 100%)"
                    : "linear-gradient(180deg, #a855f7 10%, #7c3aed 55%, #6d28d9 100%)",
                  boxShadow: "inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 0 rgba(0,0,0,0.45)",
                }}>
                  {isSpidey ? (
                    <svg viewBox="0 0 24 24" fill="white" className="w-16 h-16 drop-shadow-[0_0_8px_rgba(255,255,255,0.85)] filter animate-pulse">
                      <ellipse cx="12" cy="11" rx="2.5" ry="3.5" />
                      <circle cx="12" cy="6" r="1.6" />
                      <path d="M10.5 10c-2.5-1-4.5-3-5-6M10.5 11.5c-3 .5-5 .5-6-2.5M10.5 12.5c-2.5 1.5-4.5 3.5-4 7M10.5 13.5c-1.5 2-2.5 4.5-1.5 7" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                      <path d="M13.5 10c2.5-1 4.5-3 5-6M13.5 11.5c3 .5 5 .5 6-2.5M13.5 12.5c2.5 1.5 4.5 3.5 4 7M13.5 13.5c1.5 2-2.5 4.5-1.5 7" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <span className="clash-font text-white text-4xl sm:text-5xl font-extrabold" style={{ textShadow: "0 2px 0 rgba(0,0,0,0.35)" }}>?</span>
                  )}
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
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight break-words line-clamp-2"
                  style={{ textShadow: "0 2px 0 rgba(0,0,0,0.45)" }}
                >
                  {data.name}
                </h1>
                {isSpidey ? (
                  <svg viewBox="0 0 24 24" className="w-7 h-7 -translate-y-0.5 shrink-0 filter drop-shadow-[0_1.5px_3px_rgba(239,68,68,0.7)] animate-pulse" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.14 2.52 7.7 6.13 9.24.47.2.87-.2.87-.7v-1.78c0-.6.38-1.12.94-1.3l.12-.04c1.28-.42 2.6-.42 3.88 0l.12.04c.56.18.94.7.94 1.3v1.78c0 .5.4.9.87.7C21.48 19.7 24 16.14 24 12c0-5.52-4.48-10-10-10z" fill="#ef4444" />
                    <path d="M12 2v18M2 12h20M5 5l14 14M19 5L5 19" stroke="rgba(0, 0, 0, 0.45)" strokeWidth="0.8" />
                    <path d="M7.5 9.5c0 0 1.5 2 4.5 2V10.5C12 10.5 9.5 9 7.5 9.5z" fill="#ffffff" stroke="#000000" strokeWidth="0.8" />
                    <path d="M16.5 9.5c0 0-1.5 2-4.5 2V10.5C12 10.5 14.5 9 16.5 9.5z" fill="#ffffff" stroke="#000000" strokeWidth="0.8" />
                  </svg>
                ) : (
                  <Image src="/cr-crown.svg" alt="Crown" width={28} height={18} className="-translate-y-1 shrink-0" />
                )}
              </div>
              <div className="mt-2 flex items-start gap-2 text-white/85 text-xs sm:text-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.314-2.686-6-6-6zm0 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor" />
                </svg>
                <span className="">{data.location}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {data.jobTitle.split(",").map((title) => title.trim()).filter(Boolean).map((title, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center rounded-md px-2.5 py-1.5 text-white/90 text-xs sm:text-sm font-semibold"
                    style={{
                      border: "1px solid color-mix(in oklab, var(--cr-blue) 22%, white 10%)",
                      background:
                        "linear-gradient(180deg, color-mix(in oklab, var(--cr-blue) 20%, transparent), color-mix(in oklab, var(--cr-navy) 65%, #0b1736 35%))",
                    }}
                  >
                    {title}
                  </div>
                ))}
              </div>
            </div>
            <div className="ml-3 shrink-0 grid gap-2 text-sm">
              {/* mobile: icon-only circular buttons */}
              <div className="flex flex-col items-center gap-2 sm:hidden">
                <a
                  href={data.resumes?.[0]?.url || data.resumeUrl || "#"}
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
                  href={data.resumes?.[0]?.url || data.resumeUrl || "#"}
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
                {isSpidey ? (
                  <svg viewBox="0 0 24 24" fill="white" className="w-36 h-36 drop-shadow-[0_0_15px_rgba(255,255,255,0.85)] filter animate-pulse z-10">
                    <ellipse cx="12" cy="11" rx="2.5" ry="3.5" />
                    <circle cx="12" cy="6" r="1.6" />
                    <path d="M10.5 10c-2.5-1-4.5-3-5-6M10.5 11.5c-3 .5-5 .5-6-2.5M10.5 12.5c-2.5 1.5-4.5 3.5-4 7M10.5 13.5c-1.5 2-2.5 4.5-1.5 7" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M13.5 10c2.5-1 4.5-3 5-6M13.5 11.5c3 .5 5 .5 6-2.5M13.5 12.5c2.5 1.5 4.5 3.5 4 7M13.5 13.5c1.5 2-2.5 4.5-1.5 7" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <span
                    className="clash-font text-white text-8xl sm:text-9xl font-extrabold"
                    style={{
                      textShadow:
                        "0 3px 0 rgba(0,0,0,0.35), 0 0 12px rgba(255,255,255,0.2)",
                    }}
                  >
                    ?
                  </span>
                )}
              </div>
              {/* glass glare sweep once centered */}
              {isCentered && (
                <div aria-hidden className="pointer-events-none absolute inset-0 cr-glare-sweep" />
              )}
              {/* celebration burst on reveal */}
              {celebrate && (
                <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
                  <div className="cr-shockwave absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                  {Array.from({ length: 14 }).map((_, i) => (
                    <span
                      key={i}
                      className="cr-confetti absolute left-1/2 top-1/2"
                      style={{
                        ["--tx"]: `${(Math.cos((i / 14) * Math.PI * 2) * (60 + (i % 3) * 22)).toFixed(0)}px`,
                        ["--ty"]: `${(Math.sin((i / 14) * Math.PI * 2) * (-70 - (i % 3) * 20)).toFixed(0)}px`,
                        background: isSpidey 
                          ? ["#ef4444", "#ffffff", "#1d4ed8"][i % 3]
                          : ["#f2c94c", "#ffffff", "#b277ff"][i % 3],
                        height: isSpidey && i % 2 === 0 ? "16px" : "10px",
                        width: isSpidey && i % 2 === 0 ? "2px" : "6px",
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
      {/* Resume Option Selection Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-[110] grid place-items-center p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="Select Resume">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowResumeModal(false)} />
          <div className="relative z-[111] w-full max-w-[min(94vw,400px)] rounded-[20px] overflow-hidden animate-in fade-in zoom-in-95 duration-150" style={{
            background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
            transform: `scale(${resumeScale})`,
            transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
          }}>
            <div className="relative flex items-center px-4 py-4 border-b border-white/10" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            }}>
              <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide text-xs sm:text-sm text-center uppercase" style={{
                textShadow: "0 2px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45)",
                letterSpacing: 1,
              }}>Select Resume</div>
              <button
                type="button"
                onClick={() => setShowResumeModal(false)}
                aria-label="Close"
                className="grid place-items-center z-10"
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 55%, #b73838 100%)",
                  boxShadow: "inset 0 3px 0 rgba(255,255,255,0.85), 0 2px 0 rgba(0,0,0,0.25)",
                  border: "1px solid rgba(0,0,0,0.45)",
                }}
              >
                <span className="text-white font-extrabold text-xs" style={{ textShadow: "0 1px 0 rgba(0,0,0,0.3)", lineHeight: 1 }}>x</span>
              </button>
            </div>
            <div className="px-4 py-5 sm:px-5">
              <div className="rounded-xl p-3 sm:p-4" style={{
                background: "linear-gradient(180deg, #f5f9ff 0%, #e3ecfb 40%, #cfdbf1 100%)",
                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
              }}>
                <div className="space-y-2.5">
                  {data.resumes?.map((resume, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        window.open(resume.url, "_blank");
                        setShowResumeModal(false);
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-lg text-left transition-all border cr-glass-hover cursor-pointer"
                      style={{
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "linear-gradient(180deg, #ffffff 0%, #f3f7ff 100%)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.04), inset 0 1px 0 #fff",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-[#5ea0ff]/10 text-[#2f66d0]">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-extrabold text-[#233457]">{resume.label}</div>
                          <div className="text-[10px] text-[#233457]/60 mt-0.5">Click to view or download PDF</div>
                        </div>
                      </div>
                      <div className="text-[#2f66d0]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </button>
                  ))}
                  {/* Fallback default button removed to only show tailored resumes in this list */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
