"use client";
import Card from "@/components/ui/Card";
import { useEffect, useRef, useState } from "react";

type Item = {
  role: string;
  org: string;
  start: string;
  end?: string;
  awards?: string[];
};

const timeline: Item[] = [
  { role: "Software Developer Freelancer", org: "Private Individuals", start: "2024", end: "Present" },
  {
    role: "BS Information Technology",
    org: "Mindoro State University",
    start: "2022",
    end: "2026",
    awards: [
      "Consistent Dean's Lister",
      "Running for Magna Cum Laude",
    ],
  },
  { role: "Wrote my first line of code", org: "Hello World", start: "2018" },
];

function PeriodPill({ start, end }: { start: string; end?: string }) {
  const text = end ? `${start}  —  ${end}` : start;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] text-black font-extrabold"
      style={{
        border: "1px solid color-mix(in oklab, var(--accent) 55%, #8f6a12 45%)",
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--accent) 92%, white 6%), color-mix(in oklab, var(--accent) 70%, #b68b1a 30%))",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.35)",
      }}
    >
      {text}
    </span>
  );
}

function TimelineContent({ isModal = false }: { isModal?: boolean }) {
  return (
    <div className="relative">
      {/* vertical line */}
      <div className="absolute left-3 top-0 bottom-0" aria-hidden>
        <div className="h-full w-px"
          style={{
            background: isModal
              ? "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.08))"
              : "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
          }}
        />
      </div>
      <ol className="space-y-5">
        {timeline.map((item) => (
          <li key={`${item.role}-${item.start}`} className="relative pl-8 group">
            {/* node */}
            <span
              className="absolute left-2 top-1.5 h-3.5 w-3.5 rounded-full transition-transform duration-200 group-hover:scale-110"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #fff 0%, #d1d5db 25%, #9ca3af 55%, rgba(0,0,0,0.2) 100%)",
                boxShadow: "0 0 0 2px rgba(255,255,255,0.16), 0 2px 8px rgba(0,0,0,0.45)",
              }}
              aria-hidden
            />
            {/* hover glow halo */}
            <span
              aria-hidden
              className="absolute left-1 top-0 h-6 w-6 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--accent) 85%, white 10%) 0%, rgba(242,201,76,0.45) 45%, rgba(242,201,76,0.05) 75%, transparent 100%)",
                filter: "saturate(1.2)",
              }}
            />

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className={isModal ? "font-semibold text-[#233457]" : "font-semibold text-white/95"}>{item.role}</div>
                <div className={isModal ? "text-sm text-[#233457]/75" : "text-sm text-white/70"}>{item.org}</div>
              </div>
              <div className="shrink-0"><PeriodPill start={item.start} end={item.end} /></div>
            </div>

            {item.awards && (
              <ul className={`mt-2 space-y-1 text-[12px] ${isModal ? "text-amber-600" : "text-amber-300/90"}`}>
                {item.awards.map((a) => (
                  <li key={a} className="pl-1" style={{ textShadow: isModal ? "0 1px 0 rgba(255,255,255,0.5)" : "0 1px 0 rgba(0,0,0,0.35)" }}>
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Experience() {
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
              <path d="M9 4a2 2 0 0 0-2 2H5.75A2.75 2.75 0 0 0 3 8.75v7.5A2.75 2.75 0 0 0 5.75 19h12.5A2.75 2.75 0 0 0 21 16.25v-7.5A2.75 2.75 0 0 0 18.25 6H17a2 2 0 0 0-2-2H9Zm2 2h2a1 1 0 0 1 1 1H10a1 1 0 0 1 1-1Z" fill="currentColor"/>
            </svg>
            <span>Experience</span>
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
        className="col-span-full lg:col-span-5 xl:col-span-4"
      >
        <TimelineContent />
      </Card>

      {/* Full experience modal */}
      {showFull && (
        <div className="fixed inset-0 z-[110] grid place-items-center" role="dialog" aria-modal="true" aria-label="Full Experience">
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
              }}>Full Experience</div>
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
              <div className="rounded-xl p-4 relative overflow-hidden" style={{
                background:
                  "linear-gradient(180deg, #f5f9ff 0%, #e3ecfb 40%, #cfdbf1 100%)",
                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
              }}>
                <TimelineContent isModal={true} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
