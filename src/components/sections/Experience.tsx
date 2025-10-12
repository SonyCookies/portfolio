import Card from "@/components/ui/Card";

type Item = {
  role: string;
  org: string;
  start: string;
  end?: string;
  awards?: string[];
};

const timeline: Item[] = [
  { role: "Jr. Software Engineer", org: "eTap Inc.", start: "2025", end: "Present" },
  { role: "Full-Stack Developer Intern", org: "Infinitech Advertising Corporation", start: "2025" },
  { role: "Software Developer Freelancer", org: "Private Individuals", start: "2023", end: "Present" },
  {
    role: "BS Information Technology",
    org: "Mindoro State University",
    start: "2021",
    end: "2025",
    awards: [
      "Best Capstone Project",
      "Best On-The-Job Trainee",
      "Magna Cum Laude (GWA: 1.4070)",
    ],
  },
  { role: "Wrote my first line of code", org: "Hello World", start: "2020" },
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

export default function Experience() {
  return (
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
      className="col-span-full lg:col-span-5 xl:col-span-4"
    >
      <div className="relative">
        {/* vertical line */}
        <div className="absolute left-3 top-0 bottom-0" aria-hidden>
          <div className="h-full w-px"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
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
                  <div className="font-semibold text-white/95">{item.role}</div>
                  <div className="text-sm text-white/70">{item.org}</div>
                </div>
                <div className="shrink-0"><PeriodPill start={item.start} end={item.end} /></div>
              </div>

              {item.awards && (
                <ul className="mt-2 space-y-1 text-[12px] text-amber-300/90">
                  {item.awards.map((a) => (
                    <li key={a} className="pl-1" style={{ textShadow: "0 1px 0 rgba(0,0,0,0.35)" }}>
                      {a}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}
