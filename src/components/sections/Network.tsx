"use client";
import { useEffect, useState, useRef } from "react";
import Card from "@/components/ui/Card";
import { getNetworkData, type NetworkData } from "@/lib/network-data";

// Helper function to get social icon SVG
function getSocialIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case "linkedin":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 3h4v4H4V3Zm0 6h4v12H4V9Zm6 0h4v2.5h.06A4.38 4.38 0 0 1 18 8.88C20.28 8.88 22 10.38 22 13.7V21h-4v-6.04c0-1.44-.52-2.42-1.83-2.42-1 .02-1.62.66-1.89 1.35-.1.24-.12.57-.12.9V21h-4V9Z"/>
        </svg>
      );
    case "github":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 .5C5.73.5.98 5.24.98 11.5c0 4.85 3.14 8.96 7.5 10.41.55.1.75-.24.75-.53v-1.86c-3.05.67-3.69-1.29-3.69-1.29-.5-1.27-1.23-1.61-1.23-1.61-1-.69.07-.67.07-.67 1.1.08 1.68 1.13 1.68 1.13.99 1.7 2.6 1.21 3.23.92.1-.73.39-1.21.71-1.49-2.44-.28-5.01-1.22-5.01-5.43 0-1.2.43-2.17 1.13-2.94-.11-.28-.49-1.42.1-2.95 0 0 .92-.29 3.01 1.12a10.3 10.3 0 0 1 5.48 0c2.09-1.41 3.01-1.12 3.01-1.12.59 1.53.21 2.67.1 2.95.7.77 1.13 1.74 1.13 2.94 0 4.22-2.58 5.14-5.04 5.41.4.34.76 1 .76 2.03v3.01c0 .29.2.63.76.53 4.35-1.45 7.49-5.56 7.49-10.41C23.02 5.24 18.27.5 12 .5Z"/>
        </svg>
      );
    case "instagram":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5.2A4.8 4.8 0 1 0 16.8 13 4.81 4.81 0 0 0 12 8.2Zm0 7.6A2.8 2.8 0 1 1 14.8 13 2.8 2.8 0 0 1 12 15.8Zm5.85-9.9a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3Z" fill="currentColor"/>
        </svg>
      );
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        </svg>
      );
  }
}

export default function Network() {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFull, setShowFull] = useState(false);
  const [scale, setScale] = useState(0.96);
  const timerRef = useRef<number | null>(null);

  // Load network data from Firestore
  useEffect(() => {
    const loadNetworkData = async () => {
      try {
        setLoading(true);
        const data = await getNetworkData();
        setNetworkData(data);
      } catch (error) {
        console.error("Error loading network data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadNetworkData();
  }, []);

  // Full modal scale animation
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

  if (loading || !networkData) {
    return (
      <Card
        title={
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Connect</span>
          </>
        }
        className="col-span-full"
      >
        <div className="grid gap-4 lg:grid-cols-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="lg:col-span-3 animate-pulse">
              <div className="h-4 w-24 bg-white/10 rounded mb-2" />
              <div className="h-20 bg-white/10 rounded-xl" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
      title={
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Connect</span>
        </>
      }
      className="col-span-full"
    >
      <div className="grid gap-4 lg:grid-cols-12">
        {/* A member of */}
        <div className="lg:col-span-3">
          <div className="mb-2 font-semibold text-white/95 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>A member of</span>
            </div>
            {networkData.memberships.length > 2 && (
              <button
                type="button"
                onClick={() => setShowFull(true)}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold text-white active:translate-y-0.5 transition cr-glass-hover"
                style={{
                  border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                  background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                }}
                title="View all memberships"
              >
                <span>View all</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
          <ul className="space-y-3">
            {networkData.memberships.slice(0, 2).map((t, index) => (
              <li key={index} className="rounded-xl p-3" style={{
                border: "1px solid rgba(255,255,255,0.14)",
                background: "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
              }}>
                <div className="text-xs sm:text-sm text-white/90 leading-snug">{t}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Links */}
        <div className="lg:col-span-3">
          <div className="mb-2 font-semibold text-white/95 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 5h16v14H4z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>Social Links</span>
          </div>
          <div className="grid gap-3">
            {networkData.socialLinks.map(({ label, href, icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl p-3 cr-glass-hover" style={{
                border: "1px solid rgba(255,255,255,0.14)",
                background: "linear-gradient(180deg, #1e2a4d 0%, #0f1a3a 60%, #0b1530 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45)",
              }}>
                <span className="inline-grid place-items-center rounded-md" style={{ width: 28, height: 28, background: "#fff", color: "#0b1530" }}>
                  {icon ? getSocialIcon(icon) : getSocialIcon(label)}
                </span>
                <span className="text-xs sm:text-sm text-white/90">{label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Speaking */}
        <div className="lg:col-span-3">
          <div className="mb-2 font-semibold text-white/95 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Speaking</span>
          </div>
          <div className="rounded-xl p-3 relative overflow-hidden" style={{
            background: "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
          }}>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed">{networkData.speaking}</p>
            <a href="#contact" className="mt-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-semibold text-white active:translate-y-0.5 transition cr-glass-hover" style={{
              border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
              background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
            }}>
              <span>Get in touch</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>

        {/* Contact tiles */}
        <div className="lg:col-span-3 grid gap-3">
          {networkData.contactTiles.map(({ title, desc, href }, index) => (
            <a key={index} href={href || "#contact"} className="rounded-xl p-3 flex items-center justify-between cr-glass-hover" style={{
              border: "1px solid rgba(255,255,255,0.14)",
              background: "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
            }}>
              <div>
                <div className="font-semibold text-white/90 text-xs sm:text-sm">{title}</div>
                <div className="text-[10px] sm:text-xs text-white/70">{desc}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </Card>

      {/* View All Memberships Modal */}
      {showFull && networkData && (
        <div className="fixed inset-0 z-[110] grid place-items-center p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="All Memberships">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFull(false)} />
          <div className="relative z-[111] w-full max-w-[96vw] sm:max-w-[820px] rounded-[16px] sm:rounded-[24px] overflow-hidden max-h-[95vh] overflow-y-auto" style={{
            background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
            transform: `scale(${scale})`,
            transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
          }}>
            <div className="relative flex items-center px-3 py-3 sm:px-6 sm:py-6" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            }}>
              <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide text-[10px] sm:text-sm px-2 text-center max-w-[calc(100%-80px)] truncate" style={{
                textTransform: "uppercase",
                textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45), -1px -1px 0 #1c2744, 1px -1px 0 #1c2744, -1px 1px 0 #1c2744, 1px 1px 0 #1c2744",
                letterSpacing: 1,
              }}>All Memberships</div>
              <button
                type="button"
                onClick={() => setShowFull(false)}
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
                  {networkData.memberships.map((membership, index) => (
                    <div
                      key={index}
                      className="rounded-lg p-3"
                      style={{
                        border: "1px solid rgba(0,0,0,0.12)",
                        background: "linear-gradient(180deg, #f5f9ff 0%, #e3ecfb 40%, #cfdbf1 100%)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), 0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div className="text-sm text-[#233457] leading-snug">{membership}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
