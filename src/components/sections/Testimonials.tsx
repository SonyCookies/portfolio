"use client";
import Card from "@/components/ui/Card";
import { useEffect, useState, useRef } from "react";

const testimonials = [
  {
    quote:
      "Sonny’s technical expertise is top‑notch, but what really sets him apart is his ability to understand business needs and translate them into scalable solutions.",
    author: "— at",
  },
  {
    quote:
      "Thinks in systems, ships reliably, and elevates team velocity with practical patterns and tooling.",
    author: "— at",
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const count = testimonials.length;

  const next = () => setIndex((i) => (i + 1) % count);
  const prev = () => setIndex((i) => (i - 1 + count) % count);

  // auto-advance
  useEffect(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 5000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [count]);

  const pauseAuto = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  const resumeAuto = () => {
    if (!timerRef.current) {
      timerRef.current = window.setInterval(() => {
        setIndex((i) => (i + 1) % count);
      }, 5000);
    }
  };

  const t = testimonials[index];

  return (
    <Card
      title={
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6h12v12H6z" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 9h8M8 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Testimonials</span>
        </>
      }
      className="col-span-full lg:col-span-6"
    >
      <div className="relative" onMouseEnter={pauseAuto} onMouseLeave={resumeAuto}>
        <div className="min-h-[96px]">
          <blockquote key={index} className="text-white/85 leading-relaxed transition-opacity duration-300">“{t.quote}”</blockquote>
          <div className="mt-4 text-sm text-white/60">{t.author}</div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => setIndex(i)}
                className="h-2 w-2 rounded-full transition"
                style={{ background: i === index ? "#fff" : "rgba(255,255,255,0.5)" }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous"
              onClick={prev}
              className="inline-flex items-center justify-center rounded-full active:translate-y-0.5 transition cr-glass-hover"
              style={{
                width: 28,
                height: 28,
                border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 14px -10px rgba(0,0,0,0.55)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M19 12H5m6 6-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={next}
              className="inline-flex items-center justify-center rounded-full active:translate-y-0.5 transition cr-glass-hover"
              style={{
                width: 28,
                height: 28,
                border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 14px -10px rgba(0,0,0,0.55)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14m-6 6 6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
