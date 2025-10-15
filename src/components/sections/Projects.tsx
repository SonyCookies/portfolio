import Card from "@/components/ui/Card";
// images removed for recent projects

const projects = [
  {
    title: "AI-Powered Flood Prediction System",
    desc: "Developed a predictive model for river discharge and climate trends, achieving low error metrics (MAE: 2.64) for local bridge safety.",
    img: "/FLOOD_PREDICTION.png", // Updated image in public/
    tags: ["LSTM Neural Networks", "Python", "Time-Series Analysis", "APIs"],
    href: "https://github.com/SonyCookies/FLOODPREDICTION",
    repo: "https://github.com/SonyCookies/FLOODPREDICTION",
  },
  {
    title: "MEGG - AI Defect Detection & Sorting",
    desc: "Engineered a portable system for real-time egg defect classification and automated sorting using Computer Vision and microcontrollers.",
    img: "/ai-sorting.svg", // Placeholder image path
    tags: ["Computer Vision", "Raspberry Pi", "Arduino Mega", "Next.js/FastAPI"],
    href: "https://megg-kiosk.vercel.app/",
    repo: "#",
  },
];
function ProjectCard({ p }: { p: typeof projects[number] }) {
  return (
    <a href={p.href} className="group block">
      <div
        className="overflow-hidden rounded-xl cr-glass-hover"
        style={{
          border: "1px solid rgba(255,255,255,0.14)",
          background:
            "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 30px -18px rgba(0,0,0,0.6)",
        }}
      >
        <div className="p-4 pt-5">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-semibold text-white/95 group-hover:text-white transition-colors">{p.title}</h4>
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
          <p className="mt-1 text-sm text-white/80">{p.desc}</p>
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
  return (
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
        <a
          href="#"
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-semibold text-white active:translate-y-0.5 transition cr-glass-hover"
          style={{
            border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
            background:
              "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
          }}
        >
          <span>View all</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      }
      className="col-span-full lg:col-span-8 xl:col-span-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard key={p.title} p={p} />
        ))}
      </div>
    </Card>
  );
}
