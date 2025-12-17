"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function QuickNav() {
  const [theme, setTheme] = useState<"theme-light" | "theme-dark" | "theme-royale">("theme-royale");
  const [showAbout, setShowAbout] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showDecksModal, setShowDecksModal] = useState(false);
  const [aboutTab, setAboutTab] = useState<"about" | "links">("about");
  const [aboutScale, setAboutScale] = useState(0.96);
  const [themeScale, setThemeScale] = useState(0.96);
  const [decksScale, setDecksScale] = useState(0.96);
  const [showTrophyModal, setShowTrophyModal] = useState(false);
  const [trophyScale, setTrophyScale] = useState(0.96);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoScale, setPhotoScale] = useState(0.96);
  const [expandedAchievement, setExpandedAchievement] = useState<string | null>(null);
  const aboutTimerRef = useRef<number | null>(null);
  const themeTimerRef = useRef<number | null>(null);
  const decksTimerRef = useRef<number | null>(null);
  const photoTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!showAbout) return;
    setAboutScale(0.96);
    const raf = requestAnimationFrame(() => {
      setAboutScale(1.06);
      aboutTimerRef.current = window.setTimeout(() => {
        setAboutScale(1.0);
        aboutTimerRef.current = null;
      }, 120);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (aboutTimerRef.current) {
        clearTimeout(aboutTimerRef.current);
        aboutTimerRef.current = null;
      }
    };
  }, [showAbout]);

  // Theme modal scale animation
  useEffect(() => {
    if (!showThemeModal) return;
    setThemeScale(0.96);
    const raf = requestAnimationFrame(() => {
      setThemeScale(1.06);
      themeTimerRef.current = window.setTimeout(() => {
        setThemeScale(1.0);
        themeTimerRef.current = null;
      }, 120);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (themeTimerRef.current) {
        clearTimeout(themeTimerRef.current);
        themeTimerRef.current = null;
      }
    };
  }, [showThemeModal]);

  // Decks modal scale animation
  useEffect(() => {
    if (!showDecksModal) return;
    setDecksScale(0.96);
    const raf = requestAnimationFrame(() => {
      setDecksScale(1.06);
      decksTimerRef.current = window.setTimeout(() => {
        setDecksScale(1.0);
        decksTimerRef.current = null;
      }, 120);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (decksTimerRef.current) {
        clearTimeout(decksTimerRef.current);
        decksTimerRef.current = null;
      }
    };
  }, [showDecksModal]);

  // Trophy modal scale animation
  useEffect(() => {
    if (!showTrophyModal) return;
    setTrophyScale(0.96);
    const raf = requestAnimationFrame(() => {
      setTrophyScale(1.06);
      const id = window.setTimeout(() => {
        setTrophyScale(1.0);
      }, 120);
      return () => clearTimeout(id);
    });
    return () => cancelAnimationFrame(raf);
  }, [showTrophyModal]);

  // Photo modal scale animation
  useEffect(() => {
    if (!showPhotoModal) return;
    setPhotoScale(0.96);
    const raf = requestAnimationFrame(() => {
      setPhotoScale(1.06);
      photoTimerRef.current = window.setTimeout(() => {
        setPhotoScale(1.0);
        photoTimerRef.current = null;
      }, 120);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (photoTimerRef.current) {
        clearTimeout(photoTimerRef.current);
        photoTimerRef.current = null;
      }
    };
  }, [showPhotoModal]);

  // Apply theme class to <html>
  useEffect(() => {
    const saved = (typeof window !== "undefined" ? localStorage.getItem("theme") : null);
    setTheme(saved === "theme-light" || saved === "theme-dark" || saved === "theme-royale" ? saved : "theme-royale");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    html.classList.remove("theme-light", "theme-dark", "theme-royale");
    html.classList.add(theme);
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);

  //

  return (
    <div className="flex items-center justify-center gap-4">
        {/* People icon -> About section (anchor) */}
        <button
          type="button"
          onClick={() => setShowAbout(true)}
          aria-label="About"
          className="inline-flex items-center justify-center rounded-2xl active:translate-y-0.5 transition cr-glass-hover"
          style={{
            width: 64,
            height: 64,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "linear-gradient(180deg, #1e2a4d 0%, #0f1a3a 60%, #0b1530 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 10px 18px -12px rgba(0,0,0,0.6)",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 6.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" fill="white"/>
            <path d="M6 18.5c0-3.3137 2.6863-6 6-6s6 2.6863 6 6" fill="white" opacity=".9"/>
          </svg>
        </button>

        {/* Theme Coming Soon modal */}
        {showThemeModal && (
          <div className="fixed inset-0 z-[110] grid place-items-center" role="dialog" aria-modal="true" aria-label="Theme">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowThemeModal(false)} />
            <div className="relative z-[111] w-[min(94vw,520px)] rounded-[24px] overflow-hidden" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
              boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
              transform: `scale(${themeScale})`,
              transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
            }}>
              <div className="relative flex items-center px-6 py-6" style={{
                background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
              }}>
                <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide" style={{
                  textTransform: "uppercase",
                  textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45), -1px -1px 0 #1c2744, 1px -1px 0 #1c2744, -1px 1px 0 #1c2744, 1px 1px 0 #1c2744",
                  letterSpacing: 1,
                }}>Theme</div>
                <button
                  type="button"
                  onClick={() => setShowThemeModal(false)}
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
                <div className="rounded-xl text-center font-extrabold" style={{
                  background: "linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%)",
                  border: "1px solid rgba(0,0,0,0.12)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                  color: "#25355d",
                  padding: "18px 16px",
                }}>
                  🎨 Theme customization is under construction in the Royal Workshop. Coming soon!
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Decks modal */}
        {showDecksModal && (
          <div className="fixed inset-0 z-[110] grid place-items-center" role="dialog" aria-modal="true" aria-label="Decks">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDecksModal(false)} />
            <div className="relative z-[111] w-[min(96vw,760px)] rounded-[28px] overflow-hidden" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
              boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
              transform: `scale(${decksScale})`,
              transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
            }}>
              <div className="relative flex items-center px-6 py-6" style={{
                background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
              }}>
                <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide" style={{
                  textTransform: "uppercase",
                  textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45), -1px -1px 0 #1c2744, 1px -1px 0 #1c2744, -1px 1px 0 #1c2744, 1px 1px 0 #1c2744",
                  letterSpacing: 1,
                }}>Decks</div>
                <button
                  type="button"
                  onClick={() => setShowDecksModal(false)}
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
              {/* CR-like content area */}
              <div className="px-5 pb-6 pt-2">
                {/* Tabs header mimic */}
                <div className="w-full h-12 rounded-md" style={{
                  background: "linear-gradient(180deg, #5a6576 0%, #475260 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                }} />
                <div className="-mt-8 flex justify-center gap-2">
                  <div className="px-5 py-2 rounded-t-xl text-sm font-extrabold" style={{
                    background: "linear-gradient(180deg, #ffffff 0%, #eef3ff 100%)",
                    border: "1px solid rgba(0,0,0,0.22)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.95)",
                    color: "#233457",
                  }}>Deck 1</div>
                </div>
                {/* Coming soon content */}
                <div className="mt-3">
                  <div className="rounded-xl text-center font-extrabold" style={{
                    background: "linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%)",
                    border: "1px solid rgba(0,0,0,0.12)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                    color: "#25355d",
                    padding: "18px 16px",
                  }}>
                    🃏 Decks are being forged in the Royal Foundry. Coming soon!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Theme toggle: cycles Light -> Dark -> Royale */}
        <button
          type="button"
          aria-label="Toggle theme"
          title={`Theme: ${theme.replace("theme-", "")}`}
          onClick={() => setShowThemeModal(true)}
          className="inline-flex items-center justify-center rounded-2xl active:translate-y-0.5 transition cr-glass-hover"
          style={{
            width: 64,
            height: 64,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "linear-gradient(180deg, #1e2a4d 0%, #0f1a3a 60%, #0b1530 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 10px 18px -12px rgba(0,0,0,0.6)",
          }}
        >
          {/* icon changes slightly per theme */}
          {theme === "theme-light" && (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" fill="#ffd54a"/>
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="#ffd54a" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          )}

        
          {theme === "theme-dark" && (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M21 12.5A9 9 0 0 1 11.5 3 7 7 0 1 0 21 12.5Z" fill="#cbd5e1"/>
            </svg>
          )}
          {theme === "theme-royale" && (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 9 8 6l4 3 4-3 3 3v9H5V9Z" fill="#f2c94c"/>
              <path d="M7 18h10" stroke="#0b1530" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>
        {/* Decks icon (opens decks modal) */}
        <button
          type="button"
          aria-label="Decks"
          onClick={() => setShowDecksModal(true)}
          className="inline-flex items-center justify-center rounded-2xl active:translate-y-0.5 transition cr-glass-hover"
          style={{
            width: 64,
            height: 64,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "linear-gradient(180deg, #1e2a4d 0%, #0f1a3a 60%, #0b1530 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 10px 18px -12px rgba(0,0,0,0.6)",
          }}
        >
          {/* Simple stacked-cards glyph */}
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="5" y="6" width="12" height="14" rx="2" fill="#7cb3ff" stroke="#1a3b7a" strokeWidth="1.5"/>
            <rect x="7.5" y="4" width="12" height="14" rx="2" fill="#b3d2ff" stroke="#1a3b7a" strokeWidth="1.5" opacity=".8"/>
            <rect x="10" y="2.5" width="12" height="14" rx="2" fill="#d4e6ff" stroke="#1a3b7a" strokeWidth="1.5" opacity=".6"/>
          </svg>
        </button>
        {/* Achievement/Trophy button */}
        <button
          type="button"
          aria-label="Achievements"
          onClick={() => setShowTrophyModal(true)}
          className="inline-flex items-center justify-center rounded-2xl active:translate-y-0.5 transition cr-glass-hover"
          style={{
            width: 64,
            height: 64,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "linear-gradient(180deg, #1e2a4d 0%, #0f1a3a 60%, #0b1530 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 10px 18px -12px rgba(0,0,0,0.6)",
          }}
        >
          <Image src="/cr-trophy.svg" alt="Trophy" width={36} height={36} />
        </button>
        {showAbout && (
          <div className="fixed inset-0 z-[110] grid place-items-center" role="dialog" aria-modal="true" aria-label="About">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAbout(false)} />
            {/* Modal card (merged) */}
            <div className="relative z-[111] w-[min(94vw,640px)] rounded-[28px] overflow-hidden" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
              boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
              transform: `scale(${aboutScale})`,
              transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
            }}>
                {/* Top header bar */}
                <div className="relative flex items-center px-6 py-7" style={{
                  background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
                }}>
                  <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide" style={{
                    textTransform: "uppercase",
                    textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45), -1px -1px 0 #1c2744, 1px -1px 0 #1c2744, -1px 1px 0 #1c2744, 1px 1px 0 #1c2744",
                    letterSpacing: 1,
                  }}>About</div>
                  <button
                    type="button"
                    onClick={() => setShowAbout(false)}
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
                    <span className="text-white font-extrabold" style={{
                      textShadow: "0 1px 0 rgba(0,0,0,0.3)",
                      lineHeight: 1,
                    }}>x</span>
                  </button>
                </div>
                {/* Inner content container area (tabs + panel) */}
                <div className="px-4 pb-6 pt-2" style={{
                  background: "linear-gradient(360deg, #808a99 0%, #6b7586 100%)"
                }}>
                  {/* Segmented tabs (rail + raised tabs) */}
                  <div className="w-full">
                    {/* Rail */}
                    <div className="h-12 " style={{
                      background: "linear-gradient(180deg, #5a6576 0%, #475260 100%)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                    }} />
                    {/* Tabs centered overlapping the rail */}
                    <div className="-mt-[38px] px-2 flex items-end justify-center gap-2 w-full">
                      <button
                        type="button"
                        onClick={() => setAboutTab("about")}
                        className="px-6 py-2 rounded-t-xl text-sm font-extrabold min-w-28"
                        style={aboutTab === "about" ? {
                          background: "linear-gradient(180deg, #ffffff 0%, #eef3ff 100%)",
                          border: "1px solid rgba(0,0,0,0.22)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 0 rgba(0,0,0,0.08)",
                          color: "#233457",
                        } : {
                          background: "linear-gradient(180deg, #7c8a9d 0%, #5e6b7c 100%)",
                          border: "1px solid rgba(0,0,0,0.32)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)",
                          color: "#eaf0ff",
                        }}
                      >Me</button>
                      <button
                        type="button"
                        onClick={() => setAboutTab("links")}
                        className="px-6 py-2 rounded-t-xl text-sm font-extrabold min-w-28"
                        style={aboutTab === "links" ? {
                          background: "linear-gradient(180deg, #ffffff 0%, #eef3ff 100%)",
                          border: "1px solid rgba(0,0,0,0.22)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 0 rgba(0,0,0,0.08)",
                          color: "#233457",
                        } : {
                          background: "linear-gradient(180deg, #7c8a9d 0%, #5e6b7c 100%)",
                          border: "1px solid rgba(0,0,0,0.32)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)",
                          color: "#eaf0ff",
                        }}
                      >Photos</button>
                    </div>
                  </div>


                  {/* Content panel wrapper */}
                  <div className="mt-4 rounded-xl" style={{
                    background: "linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%)",
                    border: "1px solid rgba(0,0,0,0.12)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                    padding: 12,
                  }}>
                  {/* Content card list style */}
                  <div className="grid gap-3">
                    {aboutTab === "about" ? (
                      <div className="rounded-lg px-4 py-3" style={{
                        background: "transparent",
                        color: "#25355d",
                        fontSize: 14,
                        lineHeight: 1.7,
                        maxHeight: "400px",
                        overflowY: "auto",
                        paddingRight: "8px",
                      }}>
                        <p style={{ marginBottom: "1em" }}>
                          My story is fundamentally rooted in Pinamalayan, Oriental Mindoro. I am Sonny Sarcia, and the rhythm of my life was initially the rhythm of the soil, belonging to a family that has tilled the land as farmers for generations. This agrarian heritage instilled a foundational respect for perseverance and the long wait for harvest.
                        </p>
                        <p style={{ marginBottom: "1em" }}>
                          But my earliest education in life came from a different kind of labor—the dedication of my mother. As she worked to pursue her own studies, she served as a kasambahay (household helper) at the home of a close family friend we call &quot;Tito.&quot; I spent much of my childhood there. Witnessing her tireless work ethic in that environment was not a mark of hardship, but a blueprint for relentless commitment. It taught me that achieving your dreams requires sacrifice, and that hard work is the most reliable path forward. This environment became a second home that instilled in me the value of effort and deep-seated gratitude.
                        </p>
                        <p style={{ marginBottom: "1em" }}>
                          My academic life began brightly at the Juan Morente Senior Memorial Pilot School. I was part of a uniquely bonded group of fast learners from Grade 1 to Grade 6. We were an inseparable academic unit, where the strength of the group was the strength of the individual. Our shared success created a comfortable reliance, forging deep bonds that persist even today.
                        </p>
                        <p style={{ marginBottom: "1em" }}>
                          The real challenge, the turning point of my life, arrived with high school. The familiar block section dissolved, and I was suddenly separated from my academic safety net. It was a moment of profound internal discomfort. For the first time, I could not lean on familiar shoulders or copy an answer; I had to sink or swim entirely on my own merit.
                        </p>
                        <p style={{ marginBottom: "1em" }}>
                          This initial fear quickly gave way to a powerful realization. The separation became an intense eye-opener that revealed my own capability. I affirmed that the fast learner was me, not just the group. This newfound self-reliance fueled a transformation: I became the top-performing student consistently from Grade 7 through Grade 10. The choice to pursue the STEM (Science, Technology, Engineering, and Mathematics) strand in Senior High was a strategic alignment of my innate curiosity with the fields of math and science, laying the groundwork for a technical future.
                        </p>
                        <p style={{ marginBottom: "1em" }}>
                          My intellectual fascination was vast, spanning the abstract logic of a Mathematician, the structured analysis of a Statistician, and the practical construction of Electrical, Mechanical, and Agricultural Engineering. Yet, despite this broad appeal, circumstances and a pragmatic assessment of opportunity led me to choose Information Technology (IT) at Mindoro State University.
                        </p>
                        <p style={{ marginBottom: "1em" }}>
                          I saw IT not as a compromise, but as the ultimate versatile tool. It is the language that underlies modern statistics, the framework that controls engineering systems, and the platform that enables scalable solutions.
                        </p>
                        <p style={{ marginBottom: "1em" }}>
                          My initial entry into the university mirrored my high school transition—I was an outsider, one of only two students from the Second District in my section, forced to thrive alone. But the solitary focus that defined my academic rigor also attracted like minds. I began to form powerful connections with academic-centric classmates, finding friends who could meet me at my level of intensity, share intellectual burdens, and offer emotional support when the weight of expectation grew heavy. My consistent status as a Dean&apos;s Lister, now culminating in the potential distinction of Magna Cum Laude, is not just an academic record; it is the ultimate vindication of the self-reliance I forged in high school.
                        </p>
                        <p style={{ marginBottom: "1em" }}>
                          The curriculum demanded the endless creation of systems after systems, lines of code, and complex projects. Though initially tiring, this relentless output ignited the true passion within me. I realized that my interest wasn&apos;t in coding for its own sake, but in the power of technology to create immediate, scalable solutions to tangible problems. This burning desire to innovate is now the engine driving my professional life.
                        </p>
                        <p style={{ marginBottom: "1em" }}>
                          My focus remains absolute. I approach my career with the same seriousness I apply to my studies, driven by the goal to establish a firm, successful foundation in the IT world.
                        </p>
                        <p style={{ marginBottom: "1em" }}>
                          Now, on the verge of graduation, my attention is shifting from the classroom to the marketplace. My final project is not a thesis, but a nascent venture. I have carefully scouted and approached talented peers—individuals with exceptional potential—to join me in building a startup.
                        </p>
                        <p>
                          This entrepreneurial endeavor is the direct result of my entire journey. Every line of code, every disciplined choice, and every hour of study is fueled by a single, unwavering mission: to return something meaningful to my parents whose lives of toil created the platform for my success, and to honor the faith of everyone who has believed in the farm boy from Pinamalayan. My success will be their legacy, realized through the power of technology.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg px-4 py-6 text-center font-extrabold" style={{
                        background: "linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%)",
                        border: "1px solid rgba(0,0,0,0.12)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                        color: "#25355d",
                      }}>
                        📸 Arena photographers are gearing up. Photos coming soon!
                      </div>
                    )}
                  </div>

                  {/* Yellow CTA */}
                  <a href="mailto:sonnypsarcia@gmail.com" className="mt-4 block w-full rounded-xl text-center font-extrabold text-black" style={{
                    background: "linear-gradient(180deg, #ffd052 0%, #f7b52d 70%, #d98f12 100%)",
                    border: "1px solid #b17a15",
                    boxShadow: "inset 0 2px 0 rgba(255,255,255,0.8), 0 10px 20px -10px rgba(0,0,0,0.35)",
                    padding: "12px 16px",
                  }}>Contact Me</a>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Trophy/Achievement Modal */}
        {showTrophyModal && (
          <div className="fixed inset-0 z-[110] grid place-items-center p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="Achievements">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTrophyModal(false)} />
            <div className="relative z-[111] w-full max-w-[96vw] sm:max-w-[820px] rounded-[16px] sm:rounded-[24px] overflow-hidden max-h-[95vh] overflow-y-auto" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
              boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
              transform: `scale(${trophyScale})`,
              transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
            }}>
              <div className="relative flex items-center px-3 py-3 sm:px-6 sm:py-6" style={{
                background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
              }}>
                <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide text-[10px] sm:text-sm px-2 text-center max-w-[calc(100%-80px)] truncate" style={{
                  textTransform: "uppercase",
                  textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45), -1px -1px 0 #1c2744, 1px -1px 0 #1c2744, -1px 1px 0 #1c2744, 1px 1px 0 #1c2744",
                  letterSpacing: 1,
                }}>Achievements & Tournaments</div>
                <button
                  type="button"
                  onClick={() => setShowTrophyModal(false)}
                  aria-label="Close"
                  className="grid place-items-center z-10"
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 55%, #b73838 100%)",
                    boxShadow: "inset 0 3px 0 rgba(255,255,255,0.85), 0 2px 0 rgba(0,0,0,0.25)",
                    border: "1px solid rgba(0,0,0,0.45)",
                  }}
                >
                  <span className="sr-only">Close</span>
                  <span className="text-white font-extrabold text-sm" style={{ textShadow: "0 1px 0 rgba(0,0,0,0.3)", lineHeight: 1 }}>x</span>
                </button>
              </div>
              <div className="px-3 pb-4 pt-3 sm:px-5 sm:pb-6 sm:pt-4">
                <div className="rounded-lg sm:rounded-xl p-3 sm:p-4 relative overflow-hidden" style={{
                  background: "linear-gradient(180deg, #f5f9ff 0%, #e3ecfb 40%, #cfdbf1 100%)",
                  border: "1px solid rgba(0,0,0,0.12)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                }}>
                  <div className="space-y-2 sm:space-y-3">
                    {/* Hack4Gov Achievement */}
                    <div
                      className="rounded-lg p-3"
                      style={{
                        border: "1px solid rgba(0,0,0,0.12)",
                        background: "linear-gradient(180deg, #f5f9ff 0%, #e3ecfb 40%, #cfdbf1 100%)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), 0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-sm font-semibold text-[#233457]">HackforGov</div>
                            <span className="px-2 py-0.5 rounded text-xs font-bold text-white" style={{
                              background: "linear-gradient(180deg, #10b981 0%, #059669 60%, #047857 100%)",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)",
                            }}>2024</span>
                          </div>
                          <div className="text-xs text-[#233457]/75 mt-1">MIMAROPA HackforGov 2024 Capture-The-Flag Competition</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setShowPhotoModal(true)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold text-white active:translate-y-0.5 transition cr-glass-hover flex-1"
                          style={{
                            border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                            background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
                          </svg>
                          <span className="truncate">View Certificate</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedAchievement(expandedAchievement === "HackforGov" ? null : "HackforGov")}
                          className="inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold text-white active:translate-y-0.5 transition cr-glass-hover flex-1"
                          style={{
                            border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                            background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                          }}
                        >
                          <svg 
                            width="12" 
                            height="12" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            aria-hidden
                            className="shrink-0"
                            style={{
                              transform: expandedAchievement === "HackforGov" ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                            }}
                          >
                            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          </svg>
                          <span className="truncate">View Detail</span>
                        </button>
                      </div>

                      <div 
                        className="overflow-hidden transition-all duration-300 ease-in-out"
                        style={{
                          maxHeight: expandedAchievement === "HackforGov" ? "500px" : "0",
                          opacity: expandedAchievement === "HackforGov" ? 1 : 0,
                        }}
                      >
                        <div className="pt-2 border-t border-[#233457]/20">
                          <p className="text-xs text-[#233457]/80 leading-relaxed mt-2">
                            <strong>Rank 5 Regional Winner – Capture the Flag</strong><br />
                            September 5, 2024 • Aziza Paradise Hotel, Puerto Princesa City, Palawan<br /><br />
                            Competed in the MIMAROPA regional hackathon focused on cybersecurity challenges and Capture-The-Flag competitions with the theme &quot;Today&apos;s Generation, Tomorrow&apos;s Champion: Shaping the Future of Cybersecurity through Shared Responsibility.&quot;
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ISITE Achievement */}
                    <div
                      className="rounded-lg p-3"
                      style={{
                        border: "1px solid rgba(0,0,0,0.12)",
                        background: "linear-gradient(180deg, #f5f9ff 0%, #e3ecfb 40%, #cfdbf1 100%)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), 0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-sm font-semibold text-[#233457]">ISITE</div>
                            <span className="px-2 py-0.5 rounded text-xs font-bold text-white" style={{
                              background: "linear-gradient(180deg, #3b82f6 0%, #2563eb 60%, #1d4ed8 100%)",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)",
                            }}>2024</span>
                          </div>
                          <div className="text-xs text-[#233457]/75 mt-1">IT Competition & Exhibition</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setExpandedAchievement(expandedAchievement === "ISITE" ? null : "ISITE")}
                          className="inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold text-white active:translate-y-0.5 transition cr-glass-hover flex-1"
                          style={{
                            border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                            background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                          }}
                        >
                          <svg 
                            width="12" 
                            height="12" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            aria-hidden
                            className="shrink-0"
                            style={{
                              transform: expandedAchievement === "ISITE" ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                            }}
                          >
                            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          </svg>
                          <span className="truncate">View Detail</span>
                        </button>
                      </div>

                      <div 
                        className="overflow-hidden transition-all duration-300 ease-in-out"
                        style={{
                          maxHeight: expandedAchievement === "ISITE" ? "500px" : "0",
                          opacity: expandedAchievement === "ISITE" ? 1 : 0,
                        }}
                      >
                        <div className="pt-2 border-t border-[#233457]/20">
                          <p className="text-xs text-[#233457]/80 leading-relaxed mt-2">
                            <strong>Top 13 National Finalist – C Programming Contest</strong><br />
                            2024<br /><br />
                            Competed in the national IT showcase event, achieving Top 13 in the C Programming Contest, demonstrating advanced programming skills and problem-solving abilities in competitive programming.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photo Modal for Certificate */}
        {showPhotoModal && (
          <div className="fixed inset-0 z-[120] grid place-items-center p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="Certificate Photo">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPhotoModal(false)} />
            <div className="relative z-[121] w-full max-w-[95vw] sm:max-w-[1200px] h-[min(95vh,800px)] max-h-[95vh] rounded-[16px] sm:rounded-[24px] overflow-hidden" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
              boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
              transform: `scale(${photoScale})`,
              transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
            }}>
              <div className="relative flex items-center px-3 py-3 sm:px-6 sm:py-6" style={{
                background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
              }}>
                <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide text-[10px] sm:text-sm px-2 text-center max-w-[calc(100%-80px)] truncate" style={{
                  textTransform: "uppercase",
                  textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45), -1px -1px 0 #1c2744, 1px -1px 0 #1c2744, -1px 1px 0 #1c2744, 1px 1px 0 #1c2744",
                  letterSpacing: 1,
                }}>HackforGov 2024 Certificate</div>
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(false)}
                  aria-label="Close"
                  className="grid place-items-center z-10"
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 55%, #b73838 100%)",
                    boxShadow: "inset 0 3px 0 rgba(255,255,255,0.85), 0 2px 0 rgba(0,0,0,0.25)",
                    border: "1px solid rgba(0,0,0,0.45)",
                  }}
                >
                  <span className="sr-only">Close</span>
                  <span className="text-white font-extrabold text-sm" style={{ textShadow: "0 1px 0 rgba(0,0,0,0.3)", lineHeight: 1 }}>x</span>
                </button>
              </div>
              <div className="px-2 pb-2 pt-2 sm:px-6 sm:pb-6 sm:pt-4 h-[calc(100%-60px)] sm:h-[calc(100%-80px)] flex items-center justify-center bg-[#1a1a1a] overflow-auto">
                <div className="w-full h-full flex items-center justify-center rounded-lg sm:rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/cert1.jpg"
                    alt="HackforGov 2024 Certificate"
                    className="w-auto h-auto max-w-full max-h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: 'block' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
