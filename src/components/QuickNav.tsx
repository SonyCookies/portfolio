"use client";
import { useEffect, useRef, useState } from "react";

export default function QuickNav() {
  const [theme, setTheme] = useState<"theme-light" | "theme-dark" | "theme-royale">("theme-royale");
  const [showAbout, setShowAbout] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showDecksModal, setShowDecksModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [aboutTab, setAboutTab] = useState<"about" | "links">("about");
  const [aboutScale, setAboutScale] = useState(0.96);
  const [themeScale, setThemeScale] = useState(0.96);
  const [decksScale, setDecksScale] = useState(0.96);
  const [menuScale, setMenuScale] = useState(0.96);
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [menuIsMobile, setMenuIsMobile] = useState(false);
  const aboutTimerRef = useRef<number | null>(null);
  const themeTimerRef = useRef<number | null>(null);
  const decksTimerRef = useRef<number | null>(null);
  const menuTimerRef = useRef<number | null>(null);
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

  // Menu modal scale animation
  useEffect(() => {
    if (!showMenuModal) return;
    setMenuScale(0.96);
    const raf = requestAnimationFrame(() => {
      setMenuScale(1.06);
      menuTimerRef.current = window.setTimeout(() => {
        setMenuScale(1.0);
        menuTimerRef.current = null;
      }, 120);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (menuTimerRef.current) {
        clearTimeout(menuTimerRef.current);
        menuTimerRef.current = null;
      }
    };
  }, [showMenuModal]);

  // Compute menu anchor near the menu icon (desktop) or center on mobile
  useEffect(() => {
    if (!showMenuModal) return;
    const update = (_e?: Event) => {
      const isMobile = window.innerWidth < 640; // sm breakpoint
      setMenuIsMobile(isMobile);
      const el = menuBtnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setMenuAnchor({ top: r.top + window.scrollY, left: r.left + window.scrollX - 12 });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [showMenuModal]);


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

        {/* CR-style Menu modal */}
        {showMenuModal && (
          <div className="fixed inset-0 z-[110]" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMenuModal(false)} />
            <div className="fixed z-[111] w-[min(92vw,360px)] rounded-[20px] overflow-visible" style={{
              top: menuIsMobile ? '50%' : menuAnchor.top,
              left: menuIsMobile ? '50%' : menuAnchor.left,
              transform: menuIsMobile ? `translate(-50%, -50%) scale(${menuScale})` : `translateX(-100%) scale(${menuScale})`,
              transformOrigin: menuIsMobile ? 'center' : 'right top',
              background: "linear-gradient(180deg, #ffffff 0%, #eaf1ff 100%)",
              boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15)",
              border: "1px solid rgba(0,0,0,0.22)",
              transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
            }}>
              {/* Pointer notch (hidden on mobile) */}
              {!menuIsMobile && (
                <div style={{
                  position: "absolute",
                  right: -10,
                  top: 56,
                  width: 0,
                  height: 0,
                  borderTop: "10px solid transparent",
                  borderBottom: "10px solid transparent",
                  borderLeft: "10px solid #eaf1ff",
                  filter: "drop-shadow(1px 0 rgba(0,0,0,0.25))",
                }} />
              )}
              <div className="p-3">
                <div className="rounded-xl text-center font-extrabold" style={{
                  background: "linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%)",
                  border: "1px solid rgba(0,0,0,0.12)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                  color: "#25355d",
                  padding: "18px 16px",
                }}>
                  🧭 Menu items are being prepared. Coming soon!
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
        {/* Menu icon -> opens CR-style menu */}
        <button
          type="button"
          aria-label="Menu"
          onClick={() => setShowMenuModal(true)}
          ref={menuBtnRef}
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
            <rect x="5.5" y="7" width="13" height="2.4" rx="1.2" fill="white"/>
            <rect x="5.5" y="11" width="13" height="2.4" rx="1.2" fill="white" opacity=".9"/>
            <rect x="5.5" y="15" width="13" height="2.4" rx="1.2" fill="white" opacity=".8"/>
          </svg>
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
                      <div className="rounded-lg px-2 py-1" style={{
                        background: "transparent",
                        color: "#25355d",
                        fontSize: 14,
                        lineHeight: 1.6,
                      }}>
                        Hi, I&apos;m Sonny Sarcia — a Full Stack Developer focused on building performant, elegant web apps with modern tooling and delightful UI polish.
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
    </div>
  );
}
