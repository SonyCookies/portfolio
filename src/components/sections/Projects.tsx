"use client";
import Card from "@/components/ui/Card";
import { useEffect, useRef, useState } from "react";
// images removed for recent projects

const projects = [
  {
    title: "AI-Powered Flood Prediction System",
    desc: "Developed a predictive model for river discharge and climate trends, achieving low error metrics (MAE: 2.64) for local bridge safety.",
    img: "/FLOOD_PREDICTION.png", // Updated image in public/
    tags: ["LSTM Neural Networks", "Python", "Time-Series Analysis", "APIs"],
    href: "https://github.com/SonyCookies/FLOODPREDICTION",
    repo: "https://github.com/SonyCookies/FLOODPREDICTION",
    isRecent: true,
  },
  {
    title: "MEGG - AI Defect Detection & Sorting",
    desc: "Engineered a portable system for real-time egg defect classification and automated sorting using Computer Vision and microcontrollers.",
    img: "/ai-sorting.svg", // Placeholder image path
    tags: ["Computer Vision", "Raspberry Pi", "Arduino Mega", "Next.js/FastAPI"],
    href: "https://megg-kiosk.vercel.app/",
    repo: "#",
    isRecent: true,
  },
  {
    title: "EZVENDO - RFID-Based Wi-Fi Vending System",
    desc: "Next-generation public Wi-Fi vending system replacing coin-operated models with an RFID digital credit system. Features ESP32-based authentication, Orange Pi Zero 3 network gateway, Next.js captive portal, Python Flask API, and Google Firestore integration for secure, cashless transactions.",
    img: "/ezvendo.svg", // Placeholder image path
    tags: ["ESP32", "RFID", "Orange Pi Zero 3", "Next.js", "Python Flask", "Google Firestore", "Iptables", "IoT"],
    href: "#",
    repo: "#",
    isRecent: false,
  },
];

function ProjectCard({ p, isModal = false }: { p: typeof projects[number]; isModal?: boolean }) {
  return (
    <a href={p.href} className="group block">
      <div
        className="overflow-hidden rounded-xl cr-glass-hover"
        style={{
          border: isModal ? "1px solid rgba(0,0,0,0.12)" : "1px solid rgba(255,255,255,0.14)",
          background: isModal
            ? "linear-gradient(180deg, #f5f9ff 0%, #e3ecfb 40%, #cfdbf1 100%)"
            : "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
          boxShadow: isModal
            ? "inset 0 1px 0 rgba(255,255,255,0.85), 0 2px 8px rgba(0,0,0,0.1)"
            : "inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 30px -18px rgba(0,0,0,0.6)",
        }}
      >
        <div className="p-4 pt-5">
          <div className="flex items-center justify-between gap-3">
            <h4 className={`font-semibold transition-colors ${isModal ? "text-[#233457] group-hover:text-[#1a2540]" : "text-white/95 group-hover:text-white"}`}>{p.title}</h4>
            <span
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-semibold text-white cr-glass-hover"
              style={{
                border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                background:
                  "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
              }}
            >
              <span>View</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <p className={`mt-1 text-sm ${isModal ? "text-[#233457]/80" : "text-white/80"}`}>{p.desc}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.tags.map((t) => (
              <span
                key={t}
                className="rounded-full px-2 py-0.5 text-[11px] font-extrabold text-black"
                style={{
                  border: "1px solid color-mix(in oklab, var(--accent) 55%, #8f6a12 45%)",
                  background:
                    "linear-gradient(180deg, color-mix(in oklab, var(--accent) 92%, white 6%), color-mix(in oklab, var(--accent) 70%, #b68b1a 30%))",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.35)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </a>
  );
}

export default function Projects() {
  const [showFull, setShowFull] = useState(false);
  const [scale, setScale] = useState(0.96);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!showFull) return;
    setScale(0.96);
    const raf = requestAnimationFrame(() => {
      setScale(1.06);
      timerRef.current = window.setTimeout(() => {
        setScale(1.0);
        timerRef.current = null;
      }, 120);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [showFull]);

  return (
    <>
    <Card
      title={
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 5h6l2 2h8v12H4V5Z" fill="currentColor"/>
          </svg>
          <span>Recent Projects</span>
        </>
      }
      action={
          <button
            type="button"
            onClick={() => setShowFull(true)}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-semibold text-white active:translate-y-0.5 transition cr-glass-hover"
          style={{
            border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
            background:
              "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
          }}
            title="View all"
        >
          <span>View all</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          </button>
      }
      className="col-span-full lg:col-span-8 xl:col-span-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
          {projects.filter((p) => p.isRecent).map((p) => (
          <ProjectCard key={p.title} p={p} />
        ))}
      </div>
    </Card>

      {/* Full projects modal */}
      {showFull && (
        <div className="fixed inset-0 z-[110] grid place-items-center" role="dialog" aria-modal="true" aria-label="All Projects">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFull(false)} />
          <div className="relative z-[111] w-[min(96vw,820px)] rounded-[24px] overflow-hidden" style={{
            background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
            transform: `scale(${scale})`,
            transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
          }}>
            <div className="relative flex items-center px-6 py-6" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            }}>
              <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide" style={{
                textTransform: "uppercase",
                textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45), -1px -1px 0 #1c2744, 1px -1px 0 #1c2744, -1px 1px 0 #1c2744, 1px 1px 0 #1c2744",
                letterSpacing: 1,
              }}>All Projects</div>
              <button
                type="button"
                onClick={() => setShowFull(false)}
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
            <div className="px-5 pb-6 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {projects.map((p) => (
                  <ProjectCard key={p.title} p={p} isModal={true} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
