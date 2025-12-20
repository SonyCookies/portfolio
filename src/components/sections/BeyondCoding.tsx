"use client";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { getBeyondCodingData, type BeyondCodingData } from "@/lib/beyondcoding-data";

export default function BeyondCoding() {
  const [beyondCodingData, setBeyondCodingData] = useState<BeyondCodingData>({
    description: "",
    interests: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBeyondCodingData = async () => {
      try {
        setLoading(true);
        const data = await getBeyondCodingData();
        setBeyondCodingData(data);
      } catch (error) {
        console.error("[BeyondCoding] Error loading beyond coding data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBeyondCodingData();
  }, []);

  return (
    <Card
      title={
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3l2.2 4.46 4.92.72-3.56 3.47.84 4.9L12 14.9l-4.4 2.3.84-4.9L4.88 8.18l4.92-.72L12 3Z" fill="currentColor"/>
          </svg>
          <span>Beyond Coding</span>
        </>
      }
      className="col-span-full lg:col-span-4 xl:col-span-4"
    >
      {loading ? (
        <div className="space-y-3">
          <div className="rounded-xl p-3 relative overflow-hidden animate-pulse" style={{
            background: "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
            border: "1px solid rgba(255,255,255,0.12)",
            minHeight: 80,
          }}>
            <div className="h-4 w-full bg-white/10 rounded mb-2" />
            <div className="h-4 w-5/6 bg-white/10 rounded mb-2" />
            <div className="h-4 w-4/6 bg-white/10 rounded" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
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
            <div className="text-white/85 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {beyondCodingData.description || "No description available yet."}
          </div>
          <div aria-hidden className="pointer-events-none absolute left-2 right-2 top-1 h-1 rounded-full" style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.03))",
          }} />
        </div>
        <div className="flex flex-wrap gap-2">
            {beyondCodingData.interests.length === 0 ? (
              <div className="text-white/60 text-xs">No interests available yet.</div>
            ) : (
              beyondCodingData.interests.map((t) => (
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
              ))
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
