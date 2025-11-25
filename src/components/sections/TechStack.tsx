"use client";
import Card from "@/components/ui/Card";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const chips = {
  "Full-Stack Frameworks & Runtime": [
    "Next.js",
    "Vue.js",
    "Django",
    "FastAPI",
    "Node.js",
  ],
  "Languages & Core Tools": [
    "JavaScript",
    "TypeScript",
    "Python",
    "SQL",
    "HTML/CSS",
    "Git",
  ],
  "Frontend & UI": [
    "React",
    "Vite",
    "TailwindCSS",
    "Bootstrap",
    "React Native",
    "Flutter",
  ],
  "Backend & Data": [
    "REST APIs",
    "MySQL",
    "NoSQL",
    "MongoDB",
    "Docker",
    "Flask",
  ],
  "AI & Specialized Systems": [
    "TensorFlow",
    "OpenAI GPT",
    "Computer Vision",
    "Microcontrollers (Arduino/Raspberry Pi)",
    "C/C++",
  ],
};

// Curated subset to display on the card (important stack)
const featured: string[] = [
  "Next.js",
  "TypeScript",
  "Python",
  "React",
  "TailwindCSS",
  "FastAPI",
  "Docker",
  "MySQL",
];
function Chip({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold text-black cr-glass-hover"
      style={{
        border: "1px solid color-mix(in oklab, var(--accent) 55%, #8f6a12 45%)",
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--accent) 92%, white 6%), color-mix(in oklab, var(--accent) 70%, #b68b1a 30%))",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.35)",
      }}
    >
      {label}
    </span>
  );
}

export default function TechStack() {
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
            <path d="M12 2 3 7l9 5 9-5-9-5Zm0 13-9-5v7l9 5 9-5v-7l-9 5Z" fill="currentColor"/>
          </svg>
          <span>Tech Stack</span>
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
          title="View full"
        >
          <span>View full</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      }
      className="col-span-full lg:col-span-7 xl:col-span-8 mt-2"
    >
      <div className="space-y-3">
        <div
          className="rounded-xl p-3 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          <div className="text-[11px] uppercase tracking-wide text-white/70 mb-2">Featured</div>
          <div className="flex flex-wrap gap-2">
            {featured.map((c) => (
              <Chip key={c} label={c} />
            ))}
          </div>
          <div aria-hidden className="pointer-events-none absolute left-2 right-2 top-1 h-1 rounded-full" style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.03))",
          }} />
        </div>
      </div>
    </Card>

    {/* Full tech modal */}
    {showFull && (
      <div className="fixed inset-0 z-[110] grid place-items-center" role="dialog" aria-modal="true" aria-label="Full Tech Stack">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFull(false)} />
        <div className="relative z-[111]">
          {/* PorcoFG image - bottom-left corner extending outside */}
          <div 
            className="absolute -bottom-3 -left-40 z-10 pointer-events-none hidden lg:block" 
            style={{ 
              width: 250, 
              height: 250,
              transform: `scale(${scale})`,
              transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
            }}
          >
            <Image
              src="/PorcoFG.png"
              alt="Porco"
              width={250}
              height={250}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>
          <div className="w-[min(96vw,820px)] rounded-[30px] overflow-hidden" style={{
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
            }}>Full Tech Stack</div>
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
          <div className="px-5 pb-6 pt-4 space-y-3">
            {Object.entries(chips).map(([group, items]) => (
              <div key={group}
                className="rounded-xl p-3 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(180deg, #f5f9ff 0%, #e3ecfb 40%, #cfdbf1 100%)",
                  border: "1px solid rgba(0,0,0,0.12)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                }}
              >
                <div className="text-[11px] uppercase tracking-wide text-[#233457]/85 mb-2">{group}</div>
                <div className="flex flex-wrap gap-2">
                  {items.map((c) => (
                    <span key={c} className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold text-black" style={{
                      border: "1px solid color-mix(in oklab, var(--accent) 55%, #8f6a12 45%)",
                      background: "linear-gradient(180deg, color-mix(in oklab, var(--accent) 92%, white 6%), color-mix(in oklab, var(--accent) 70%, #b68b1a 30%))",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.35)",
                    }}>{c}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
