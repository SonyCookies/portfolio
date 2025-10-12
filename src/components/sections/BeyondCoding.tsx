import Card from "../components/ui/Card";

export default function BeyondCoding() {
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
          <div className="text-white/85 text-sm leading-relaxed">
            Off the keyboard, I enjoy competitive strategy games, tinkering with
            hardware, and learning about design, psychology, and finance. Always
            exploring systems thinking and how it applies to real life.
          </div>
          <div aria-hidden className="pointer-events-none absolute left-2 right-2 top-1 h-1 rounded-full" style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.03))",
          }} />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "Clash Royale",
            "Chess",
            "Fitness",
            "Reading",
            "Photography",
          ].map((t) => (
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
    </Card>
  );
}
