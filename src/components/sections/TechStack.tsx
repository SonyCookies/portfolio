import Card from "@/components/ui/Card";

const chips = {
  "Programming Languages": [
    "TypeScript",
    "JavaScript",
    "Python",
    "Go",
    "Java",
    "C#",
  ],
  "Frontend": ["React", "Next.js", "TailwindCSS", "Vite", "Shadcn"],
  "Backend": ["Node.js", "Express", "tRPC", "PostgreSQL", "Prisma"],
};

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
  return (
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
        <a
          href="#"
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
        </a>
      }
      className="col-span-full lg:col-span-7 xl:col-span-8 mt-2"
    >
      <div className="space-y-3">
        {Object.entries(chips).map(([group, items]) => (
          <div key={group}
            className="rounded-xl p-3 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
          >
            <div className="text-[11px] uppercase tracking-wide text-white/70 mb-2">{group}</div>
            <div className="flex flex-wrap gap-2">
              {items.map((c) => (
                <Chip key={c} label={c} />
              ))}
            </div>
            <div aria-hidden className="pointer-events-none absolute left-2 right-2 top-1 h-1 rounded-full" style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.03))",
            }} />
          </div>
        ))}
      </div>
    </Card>
  );
}
