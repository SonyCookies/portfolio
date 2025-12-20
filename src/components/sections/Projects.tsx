"use client";
import Card from "@/components/ui/Card";
import { useEffect, useRef, useState } from "react";
import { getProjectsData, type ProjectsData, type Project, isProjectRecent } from "@/lib/projects-data";

function ProjectCard({ p, isModal = false }: { p: Project; isModal?: boolean }) {
  const hasProjectUrl = p.href && p.href !== "#";
  const hasRepoUrl = p.repo && p.repo !== "#";

  return (
    <div className="group block">
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
            <h4 className={`text-sm sm:text-base font-semibold transition-colors ${isModal ? "text-[#233457] group-hover:text-[#1a2540]" : "text-white/95 group-hover:text-white"}`}>{p.title}</h4>
            <div className="flex items-center gap-2">
              {/* Repository Icon */}
              {hasRepoUrl && (
                <a
                  href={p.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md text-white cr-glass-hover transition-transform hover:scale-110"
                  style={{
                    border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                    background:
                      "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                  }}
                  title="View Repository"
                  aria-label="View Repository"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              )}
              {/* Project Icon */}
              {hasProjectUrl && (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md text-white cr-glass-hover transition-transform hover:scale-110"
              style={{
                border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                background:
                  "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
              }}
                  title="View Project"
                  aria-label="View Project"
            >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
                </a>
              )}
            </div>
          </div>
          <p className={`mt-1 text-xs sm:text-sm ${isModal ? "text-[#233457]/80" : "text-white/80"}`}>{p.desc}</p>
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
    </div>
  );
}

export default function Projects() {
  const [projectsData, setProjectsData] = useState<ProjectsData>({
    projects: [],
  });
  const [loading, setLoading] = useState(true);
  const [showFull, setShowFull] = useState(false);
  const [scale, setScale] = useState(0.96);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const loadProjectsData = async () => {
      try {
        setLoading(true);
        const data = await getProjectsData();
        setProjectsData(data);
      } catch (error) {
        console.error("[Projects] Error loading projects data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProjectsData();
  }, []);

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
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl p-4 pt-5 animate-pulse" style={{
              background: "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
              border: "1px solid rgba(255,255,255,0.14)",
              minHeight: 150,
            }}>
              <div className="h-5 w-3/4 bg-white/10 rounded mb-2" />
              <div className="h-4 w-full bg-white/10 rounded mb-2" />
              <div className="h-4 w-5/6 bg-white/10 rounded mb-3" />
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-white/10 rounded-full" />
                <div className="h-6 w-16 bg-white/10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2">
          {projectsData.projects.filter((_, index) => isProjectRecent(index)).map((p) => (
            <ProjectCard key={p.id} p={p} />
        ))}
      </div>
      )}
    </Card>

      {/* Full projects modal */}
      {showFull && (
        <div className="fixed inset-0 z-[110] grid place-items-center p-1 sm:p-4" role="dialog" aria-modal="true" aria-label="All Projects">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFull(false)} />
          <div className="relative z-[111] w-full max-w-[98vw] sm:max-w-[820px] h-[98vh] sm:h-auto sm:max-h-[95vh] rounded-[12px] sm:rounded-[24px] overflow-hidden flex flex-col" style={{
            background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
            transform: `scale(${scale})`,
            transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
          }}>
            <div className="relative flex items-center px-3 py-2.5 sm:px-6 sm:py-6 flex-shrink-0" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            }}>
              <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide text-[9px] sm:text-sm px-2 text-center max-w-[calc(100%-70px)] truncate" style={{
                textTransform: "uppercase",
                textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45), -1px -1px 0 #1c2744, 1px -1px 0 #1c2744, -1px 1px 0 #1c2744, 1px 1px 0 #1c2744",
                letterSpacing: 1,
              }}>All Projects</div>
              <button
                type="button"
                onClick={() => setShowFull(false)}
                aria-label="Close"
                className="grid place-items-center z-10"
                style={{
                  position: "absolute",
                  right: 6,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 55%, #b73838 100%)",
                  boxShadow: "inset 0 3px 0 rgba(255,255,255,0.85), 0 2px 0 rgba(0,0,0,0.25)",
                  border: "1px solid rgba(0,0,0,0.45)",
                }}
              >
                <span className="sr-only">Close</span>
                <span className="text-white font-extrabold text-xs" style={{ textShadow: "0 1px 0 rgba(0,0,0,0.3)", lineHeight: 1 }}>x</span>
              </button>
            </div>
            <div className="px-2 sm:px-5 pb-4 sm:pb-6 pt-2 sm:pt-4 flex-1 min-h-0 overflow-y-auto">
              {loading ? (
                <div className="text-center text-white/60 py-8">Loading...</div>
              ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                  {projectsData.projects.map((p) => (
                    <ProjectCard key={p.id} p={p} isModal={true} />
                ))}
              </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
