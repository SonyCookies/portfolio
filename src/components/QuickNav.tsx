"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getQuickNavData, type QuickNavData, type Photo } from "@/lib/quicknav-data";

// Helper function to split autobiography into paragraphs
function splitIntoParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
}

export default function QuickNav() {
  const [quickNavData, setQuickNavData] = useState<QuickNavData>({
    autobiography: "",
    achievements: [],
    photos: [],
    contactEmail: "sonnypsarcia@gmail.com",
  });
  const [loading, setLoading] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [aboutTab, setAboutTab] = useState<"about" | "links">("about");
  const [aboutScale, setAboutScale] = useState(0.96);
  const [showTrophyModal, setShowTrophyModal] = useState(false);
  const [trophyScale, setTrophyScale] = useState(0.96);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoScale, setPhotoScale] = useState(0.96);
  const [showPhotoPreviewModal, setShowPhotoPreviewModal] = useState(false);
  const [photoPreviewScale, setPhotoPreviewScale] = useState(0.96);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [expandedAchievement, setExpandedAchievement] = useState<string | null>(null);
  const aboutTimerRef = useRef<number | null>(null);
  const photoTimerRef = useRef<number | null>(null);
  const photoPreviewTimerRef = useRef<number | null>(null);
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

  // Photo modal scale animation (for certificates)
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

  // Photo preview modal scale animation
  useEffect(() => {
    if (!showPhotoPreviewModal) return;
    setPhotoPreviewScale(0.96);
    const raf = requestAnimationFrame(() => {
      setPhotoPreviewScale(1.06);
      photoPreviewTimerRef.current = window.setTimeout(() => {
        setPhotoPreviewScale(1.0);
        photoPreviewTimerRef.current = null;
      }, 120);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (photoPreviewTimerRef.current) {
        clearTimeout(photoPreviewTimerRef.current);
        photoPreviewTimerRef.current = null;
      }
    };
  }, [showPhotoPreviewModal]);

  // Load QuickNav data from Firebase on mount
  useEffect(() => {
    const loadQuickNavData = async () => {
      try {
        setLoading(true);
        console.log("[QuickNav] Loading data from Firebase...");
        const data = await getQuickNavData();
        console.log("[QuickNav] Data loaded:", {
          hasAutobiography: !!data.autobiography,
          autobiographyLength: data.autobiography?.length || 0,
          photosCount: data.photos?.length || 0,
          achievementsCount: data.achievements?.length || 0,
        });
        // Ensure all arrays are defined (in case of old data structure)
        const normalizedData: QuickNavData = {
          ...data,
          achievements: data.achievements || [],
          photos: (data.photos || []).map((photo: Photo) => ({
            ...photo,
            title: photo.title || "", // Ensure title field exists for backward compatibility
          })),
        };
        setQuickNavData(normalizedData);
        console.log("[QuickNav] Data normalized and set:", {
          autobiography: normalizedData.autobiography?.substring(0, 50) + "...",
          photosCount: normalizedData.photos.length,
          achievementsCount: normalizedData.achievements.length,
        });
      } catch (error) {
        console.error("[QuickNav] Error loading QuickNav data:", error);
        // Set error state or show fallback
        setQuickNavData({
          autobiography: "",
          achievements: [],
          photos: [],
          contactEmail: "sonnypsarcia@gmail.com",
        });
      } finally {
        setLoading(false);
        console.log("[QuickNav] Loading complete");
      }
    };

    loadQuickNavData();
  }, []);

  // Render autobiography paragraphs
  const autobiographyParagraphs = splitIntoParagraphs(quickNavData.autobiography);

  // Show loading state if data not loaded
  if (loading || !quickNavData) {
    return (
      <div className="grid grid-cols-4 gap-4 items-center justify-center">
        {/* About skeleton - 1 column */}
        <div
          className="inline-flex items-center justify-center rounded-2xl animate-pulse"
          style={{
            width: 64,
            height: 64,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "linear-gradient(180deg, #1e2a4d 0%, #0f1a3a 60%, #0b1530 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 10px 18px -12px rgba(0,0,0,0.6)",
          }}
        >
          <div className="w-9 h-9 bg-white/10 rounded-full" />
        </div>
        {/* Achievement skeleton - 1 column */}
        <div
          className="inline-flex items-center justify-center rounded-2xl animate-pulse"
          style={{
            width: 64,
            height: 64,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "linear-gradient(180deg, #1e2a4d 0%, #0f1a3a 60%, #0b1530 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 10px 18px -12px rgba(0,0,0,0.6)",
          }}
        >
          <div className="w-9 h-9 bg-white/10 rounded-full" />
        </div>
        {/* Wordmark skeleton - 2 columns */}
        <div
          className="col-span-2 h-16 bg-white/10 rounded-2xl animate-pulse"
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4 items-center justify-center">
        {/* About button - 1 column */}
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

        {/* Achievement/Trophy button - 1 column */}
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

        {/* Wordmark - 2 columns */}
        <div className="col-span-2 flex items-center justify-center">
          <Image 
            src="/logos/Wordmark.png" 
            alt="Wordmark" 
            width={200} 
            height={64}
            className="h-16 w-auto object-contain"
          />
        </div>
        {showAbout && (
          <div className="fixed inset-0 z-[110] grid place-items-center" role="dialog" aria-modal="true" aria-label="About">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAbout(false)} />
            {/* Modal card (merged) */}
            <div className="relative z-[111] w-[min(94vw,640px)] lg:w-[min(94vw,900px)] h-auto lg:h-[85vh] max-h-[90vh] lg:max-h-[85vh] rounded-[28px] overflow-hidden flex flex-col" style={{
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
                <div className="px-4 pb-6 pt-2 flex-1 flex flex-col min-h-0" style={{
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
                  <div className="mt-4 rounded-xl flex-1 min-h-0 overflow-y-auto" style={{
                    background: "linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%)",
                    border: "1px solid rgba(0,0,0,0.12)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                    padding: 12,
                  }}>
                  {/* Content card list style */}
                  <div className="grid gap-3 h-full">
                    {aboutTab === "about" ? (
                      <div className="rounded-lg px-4 py-3 h-full" style={{
                        background: "transparent",
                        color: "#25355d",
                        fontSize: 14,
                        lineHeight: 1.7,
                        paddingRight: "8px",
                      }}>
                        {loading ? (
                          <div className="text-center text-[#233457]/60">Loading...</div>
                        ) : autobiographyParagraphs.length === 0 ? (
                          <div className="text-center text-[#233457]/60 py-8">
                            No autobiography available yet.
                          </div>
                        ) : (
                          autobiographyParagraphs.map((paragraph, index) => (
                            <p key={index} style={{ marginBottom: "1em" }}>
                              {paragraph}
                            </p>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="rounded-lg px-4 py-3 h-full" style={{
                        background: "transparent",
                        color: "#25355d",
                        fontSize: 14,
                        lineHeight: 1.7,
                        paddingRight: "8px",
                      }}>
                        {loading ? (
                          <div className="text-center text-[#233457]/60 py-8">Loading photos...</div>
                        ) : (!quickNavData.photos || quickNavData.photos.length === 0) ? (
                          <div className="text-center font-extrabold py-8" style={{
                        background: "linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%)",
                        border: "1px solid rgba(0,0,0,0.12)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                        color: "#25355d",
                            borderRadius: 12,
                      }}>
                        📸 Arena photographers are gearing up. Photos coming soon!
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            {(quickNavData.photos || []).map((photo: Photo) => (
                              <div
                                key={photo.id}
                                className="rounded-lg overflow-hidden border border-[#233457]/20"
                                style={{
                                  background: "linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%)",
                                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                                }}
                              >
                                <div className="relative w-full aspect-video bg-[#233457]/10">
                                  {photo.imageUrl ? (
                                    <Image
                                      src={photo.imageUrl}
                                      alt={photo.title || photo.caption || "Photo"}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-[#233457]/40">
                                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
                                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                {photo.title && (
                                  <div className="px-3 py-2 text-sm font-semibold text-[#233457] border-t border-[#233457]/10">
                                    {photo.title}
                                  </div>
                                )}
                                {photo.caption && (
                                  <div className="px-3 py-2 text-xs text-[#233457]/80 border-t border-[#233457]/10">
                                    {photo.caption}
                                  </div>
                                )}
                                {photo.imageUrl && (
                                  <div className="px-3 py-2 border-t border-[#233457]/10">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedPhoto(photo);
                                        setShowPhotoPreviewModal(true);
                                      }}
                                      className="inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold text-white active:translate-y-0.5 transition cr-glass-hover w-full"
                                      style={{
                                        border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                                        background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                                      }}
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                      </svg>
                                      <span className="truncate">View Photo</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
                  {loading ? (
                    <div className="text-center text-[#233457]/60 py-8">Loading achievements...</div>
                  ) : (!quickNavData.achievements || quickNavData.achievements.length === 0) ? (
                    <div className="text-center font-extrabold py-8" style={{
                      background: "linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%)",
                      border: "1px solid rgba(0,0,0,0.12)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                      color: "#25355d",
                      borderRadius: 12,
                    }}>
                      🏆 No achievements available yet.
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {(quickNavData.achievements || []).map((achievement) => (
                        <div
                          key={achievement.id}
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
                                <div className="text-sm font-semibold text-[#233457]">{achievement.title}</div>
                                <span className="px-2 py-0.5 rounded text-xs font-bold text-white" style={{
                                  background: achievement.id === "HackforGov" 
                                    ? "linear-gradient(180deg, #10b981 0%, #059669 60%, #047857 100%)"
                                    : "linear-gradient(180deg, #3b82f6 0%, #2563eb 60%, #1d4ed8 100%)",
                                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)",
                                }}>{achievement.year}</span>
                              </div>
                              <div className="text-xs text-[#233457]/75 mt-1">{achievement.subtitle}</div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 mb-3">
                            {achievement.hasCertificate && achievement.certificateImage && (
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
                            )}
                            <button
                              type="button"
                              onClick={() => setExpandedAchievement(expandedAchievement === achievement.id ? null : achievement.id)}
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
                                  transform: expandedAchievement === achievement.id ? "rotate(180deg)" : "rotate(0deg)",
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
                              maxHeight: expandedAchievement === achievement.id ? "500px" : "0",
                              opacity: expandedAchievement === achievement.id ? 1 : 0,
                            }}
                          >
                            <div className="pt-2 border-t border-[#233457]/20">
                              <p className="text-xs text-[#233457]/80 leading-relaxed mt-2" style={{ whiteSpace: "pre-line" }}>
                                {achievement.detail}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                }}>
                  {(() => {
                    const achievementWithCert = quickNavData.achievements.find(a => a.hasCertificate && a.certificateImage);
                    return achievementWithCert ? `${achievementWithCert.title} Certificate` : "Certificate";
                  })()}
                </div>
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
                <div className="relative w-full h-full flex items-center justify-center rounded-lg sm:rounded-xl overflow-hidden">
                  {(() => {
                    const achievementWithCert = quickNavData.achievements.find(a => a.hasCertificate && a.certificateImage);
                    return achievementWithCert?.certificateImage ? (
                      <Image
                        src={achievementWithCert.certificateImage}
                        alt={`${achievementWithCert.title} Certificate`}
                        fill
                        className="object-contain"
                        onClick={(e) => e.stopPropagation()}
                        unoptimized
                      />
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photo Preview Modal */}
        {showPhotoPreviewModal && selectedPhoto && (
          <div className="fixed inset-0 z-[120] grid place-items-center p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="Photo Preview">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPhotoPreviewModal(false)} />
            <div className="relative z-[121] w-full max-w-[95vw] sm:max-w-[1200px] h-[min(95vh,800px)] max-h-[95vh] rounded-[16px] sm:rounded-[24px] overflow-hidden" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
              boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
              transform: `scale(${photoPreviewScale})`,
              transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
            }}>
              <div className="relative flex items-center px-3 py-3 sm:px-6 sm:py-6" style={{
                background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
              }}>
                <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide text-[10px] sm:text-sm px-2 text-center max-w-[calc(100%-80px)] truncate" style={{
                  textTransform: "uppercase",
                  textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45), -1px -1px 0 #1c2744, 1px -1px 0 #1c2744, -1px 1px 0 #1c2744, 1px 1px 0 #1c2744",
                  letterSpacing: 1,
                }}>
                  {selectedPhoto.title || selectedPhoto.caption || "Photo"}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPhotoPreviewModal(false)}
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
                <div className="relative w-full h-full flex items-center justify-center rounded-lg sm:rounded-xl overflow-hidden">
                  {selectedPhoto.imageUrl && (
                    <Image
                      src={selectedPhoto.imageUrl}
                      alt={selectedPhoto.title || selectedPhoto.caption || "Photo"}
                      fill
                      className="object-contain"
                      onClick={(e) => e.stopPropagation()}
                      unoptimized
                    />
                  )}
                  </div>
                </div>
              </div>
            </div>
        )}
    </div>
  );
}
