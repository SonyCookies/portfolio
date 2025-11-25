"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import type React from "react";
import Card from "@/components/ui/Card";

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
  // Trophy modal state
  const [showTrophyModal, setShowTrophyModal] = useState(false);
  const [trophyScale, setTrophyScale] = useState(0.96);
  // Photo modal state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoScale, setPhotoScale] = useState(0.96);
  const photoTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!showTrophyModal) return;
    setTrophyScale(0.96);
    const raf = requestAnimationFrame(() => {
      setTrophyScale(1.06);
      const id = window.setTimeout(() => {
        setTrophyScale(1.0);
      }, 120);
      return () => clearTimeout(id);
    });
    return () => cancelAnimationFrame(raf);
  }, [showTrophyModal]);

  useEffect(() => {
    if (!showPhotoModal) return;
    setPhotoScale(0.96);
    const raf = requestAnimationFrame(() => {
      setPhotoScale(1.06);
      photoTimerRef.current = window.setTimeout(() => {
        setPhotoScale(1.0);
        photoTimerRef.current = null;
      }, 120);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (photoTimerRef.current) {
        clearTimeout(photoTimerRef.current);
        photoTimerRef.current = null;
      }
    };
  }, [showPhotoModal]);

  const openResume = (e?: React.MouseEvent<HTMLAnchorElement>) => {
    e?.preventDefault();
    const newTab = window.open("/resume", "_blank");
    newTab?.focus();
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
          <Image src="/LoongDrakeBG.png" alt="Banner background" fill className="object-cover object-right sm:object-center" priority />
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
              <Image src="/SONNY_PHOTO.png" alt="Profile photo" fill className="object-cover" />
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
          <button
            type="button"
            onClick={() => setShowTrophyModal(true)}
            className="absolute bottom-2 right-2 sm:bottom-3 sm:right-4 z-10 cr-float-wobble cr-pointer"
            style={{
              filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.5))",
            }}
            aria-label="Trophies"
            title="Trophies"
          >
            <Image src="/cr-trophy.svg" alt="Floating trophy" width={36} height={36} />
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
                  className="truncate text-3xl font-extrabold tracking-tight"
                  style={{ textShadow: "0 2px 0 rgba(0,0,0,0.45)" }}
                >
                  Sonny Sarcia
                </h1>
                <Image src="/cr-crown.svg" alt="Crown" width={28} height={18} className="-translate-y-1" />
              </div>
              <div className="mt-2 flex items-start gap-2 text-white/85 text-xs sm:text-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.314-2.686-6-6-6zm0 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor"/>
                </svg>
                <span className="">Pinamalayan, Oriental Mindoro</span>
              </div>
              <div
                className="inline-flex items-center rounded-md px-3 py-2 text-white/90 text-sm sm:text-base font-semibold mt-2"
                style={{
                  border: "1px solid color-mix(in oklab, var(--cr-blue) 22%, white 10%)",
                  background:
                    "linear-gradient(180deg, color-mix(in oklab, var(--cr-blue) 20%, transparent), color-mix(in oklab, var(--cr-navy) 65%, #0b1736 35%))",
                }}
              >
                Full Stack Developer
              </div>
            </div>
            <div className="ml-3 shrink-0 grid gap-2 text-sm">
              {/* mobile: icon-only circular buttons */}
              <div className="flex flex-col items-center gap-2 sm:hidden">
                <a
                  href="/resume"
                  onClick={openResume}
                  aria-label="Open resume"
                  title="Resume"
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
                  href="mailto:sonnypsarcia@gmail.com"
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
                  href="/resume"
                  onClick={openResume}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 font-extrabold active:translate-y-0.5 transition text-black cr-glass-hover"
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
                  href="mailto:sonnypsarcia@gmail.com"
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
                  src="/SONNY_PHOTO.png"
                  alt="Profile"
                  fill
                  className={`object-cover transition-opacity duration-500 ${revealPhase === "profile" ? "opacity-100" : "opacity-0"}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {showTrophyModal && (
        <div className="fixed inset-0 z-[110] grid place-items-center" role="dialog" aria-modal="true" aria-label="Achievements">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTrophyModal(false)} />
          <div
            className="relative z-[111] w-[min(96vw,820px)] rounded-[24px] overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
              boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
              transform: `scale(${trophyScale})`,
              transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
            }}
          >
            <div className="relative flex items-center px-6 py-6" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            }}>
              <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide" style={{
                textTransform: "uppercase",
                textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45), -1px -1px 0 #1c2744, 1px -1px 0 #1c2744, -1px 1px 0 #1c2744, 1px 1px 0 #1c2744",
                letterSpacing: 1,
              }}>Achievements & Tournaments</div>
              <button
                type="button"
                onClick={() => setShowTrophyModal(false)}
                aria-label="Close"
                className="grid place-items-center"
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 55%, #b73838 100%)",
                  boxShadow: "inset 0 3px 0 rgba(255,255,255,0.85), 0 2px 0 rgba(0,0,0,0.25)",
                  border: "1px solid rgba(0,0,0,0.45)",
                }}
              >
                <span className="sr-only">Close</span>
                <span className="text-white font-extrabold" style={{ textShadow: "0 1px 0 rgba(0,0,0,0.3)", lineHeight: 1 }}>x</span>
              </button>
            </div>
            <div className="px-5 pb-6 pt-4 space-y-4">
              {/* Hack4Gov Achievement */}
              <div className="rounded-xl p-4 relative overflow-hidden" style={{
                background: "linear-gradient(180deg, #f5f9ff 0%, #e3ecfb 40%, #cfdbf1 100%)",
                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
              }}>
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{
                    background: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 60%, #d97706 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.2)",
                  }}>
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-[#233457]" style={{ textShadow: "0 1px 0 rgba(255,255,255,0.8)" }}>HackforGov</h3>
                      <span className="px-2 py-0.5 rounded text-xs font-bold text-white" style={{
                        background: "linear-gradient(180deg, #10b981 0%, #059669 60%, #047857 100%)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)",
                      }}>2024</span>
                    </div>
                    <p className="text-sm text-[#233457]/80 mt-1">MIMAROPA HackforGov 2024 Capture-The-Flag Competition</p>
                    <p className="text-xs text-[#233457]/70 mt-1">September 5, 2024 • Aziza Paradise Hotel, Puerto Princesa City, Palawan</p>
                    <p className="text-sm text-[#233457]/80 mt-2 font-semibold">Rank 5 Regional Winner – Capture the Flag</p>
                    <p className="text-sm text-[#233457]/70 mt-1">Competed in the MIMAROPA regional hackathon focused on cybersecurity challenges and Capture-The-Flag competitions with the theme "Today's Generation, Tomorrow's Champion: Shaping the Future of Cybersecurity through Shared Responsibility."</p>
                    <button
                      type="button"
                      onClick={() => setShowPhotoModal(true)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold text-white active:translate-y-0.5 transition cr-glass-hover mt-3"
                      style={{
                        border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                        background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
                      </svg>
                      <span>View Certificate</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ISITE Achievement */}
              <div className="rounded-xl p-4 relative overflow-hidden" style={{
                background: "linear-gradient(180deg, #f5f9ff 0%, #e3ecfb 40%, #cfdbf1 100%)",
                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
              }}>
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{
                    background: "linear-gradient(180deg, #8b5cf6 0%, #7c3aed 60%, #6d28d9 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.2)",
                  }}>
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-[#233457]" style={{ textShadow: "0 1px 0 rgba(255,255,255,0.8)" }}>ISITE</h3>
                      <span className="px-2 py-0.5 rounded text-xs font-bold text-white" style={{
                        background: "linear-gradient(180deg, #3b82f6 0%, #2563eb 60%, #1d4ed8 100%)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)",
                      }}>2024</span>
                    </div>
                    <p className="text-sm text-[#233457]/80 mt-1">IT Competition & Exhibition</p>
                    <p className="text-xs text-[#233457]/70 mt-1">2024</p>
                    <p className="text-sm text-[#233457]/80 mt-2 font-semibold">Top 13 National Finalist – C Programming Contest</p>
                    <p className="text-sm text-[#233457]/70 mt-1">Competed in the national IT showcase event, achieving Top 13 in the C Programming Contest, demonstrating advanced programming skills and problem-solving abilities in competitive programming.</p>
                  </div>
                </div>
              </div>

              {/* Add more achievements here as needed */}
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal for Certificate */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-[120] grid place-items-center p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="Certificate Photo">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPhotoModal(false)} />
          <div className="relative z-[121] w-full max-w-[95vw] sm:max-w-[1200px] h-[min(95vh,800px)] max-h-[95vh] rounded-[16px] sm:rounded-[24px] overflow-hidden" style={{
            background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
            transform: `scale(${photoScale})`,
            transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
          }}>
            <div className="relative flex items-center px-3 py-3 sm:px-6 sm:py-6" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            }}>
              <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide text-[10px] sm:text-sm px-2 text-center max-w-[calc(100%-80px)] truncate" style={{
                textTransform: "uppercase",
                textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45), -1px -1px 0 #1c2744, 1px -1px 0 #1c2744, -1px 1px 0 #1c2744, 1px 1px 0 #1c2744",
                letterSpacing: 1,
              }}>HackforGov 2024 Certificate</div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                aria-label="Close"
                className="grid place-items-center z-10"
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 55%, #b73838 100%)",
                  boxShadow: "inset 0 3px 0 rgba(255,255,255,0.85), 0 2px 0 rgba(0,0,0,0.25)",
                  border: "1px solid rgba(0,0,0,0.45)",
                }}
              >
                <span className="sr-only">Close</span>
                <span className="text-white font-extrabold text-sm" style={{ textShadow: "0 1px 0 rgba(0,0,0,0.3)", lineHeight: 1 }}>x</span>
              </button>
            </div>
            <div className="px-2 pb-2 pt-2 sm:px-6 sm:pb-6 sm:pt-4 h-[calc(100%-60px)] sm:h-[calc(100%-80px)] flex items-center justify-center bg-[#1a1a1a] overflow-auto">
              <div className="w-full h-full flex items-center justify-center rounded-lg sm:rounded-xl overflow-hidden">
                <img
                  src="/cert1.jpg"
                  alt="HackforGov 2024 Certificate"
                  className="w-auto h-auto max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: 'block' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
    </Card>
  );
}
