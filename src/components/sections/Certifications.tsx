"use client";
import Card from "@/components/ui/Card";
import { useEffect, useRef, useState } from "react";
import { getCertificationsData, type CertificationsData, type Certificate } from "@/lib/certifications-data";

// Helper function to determine if a certificate is recent based on its index
// The first 2 certificates are automatically considered recent
function isCertRecent(certIndex: number): boolean {
  return certIndex < 2;
}

function CertItem({ 
  cert,
  isModal = false,
  onViewPhoto,
  isExpanded,
  onToggleExpand,
  isFocused = false,
  onClick,
  innerRef
}: { 
  cert: Certificate;
  isModal?: boolean;
  onViewPhoto?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isFocused?: boolean;
  onClick?: () => void;
  innerRef?: (node: HTMLDivElement | null) => void;
}) {
  const { title, org, href, details } = cert;
  if (!isModal) {
  return (
    <div 
      onClick={onClick}
      className="block group cursor-pointer"
    >
      <div
        className="rounded-lg p-3 cr-glass-hover"
        style={{
          border: "1px solid rgba(255,255,255,0.14)",
            background: "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        <div className="text-sm font-semibold text-white/95 group-hover:text-white transition-colors">
          {title}
        </div>
        <div className="text-xs text-white/70">{org}</div>
      </div>
    </div>
    );
  }

  return (
    <div
      ref={innerRef}
      className="rounded-lg p-3 transition-all duration-300"
      style={{
        border: isFocused ? "2px solid #5ea0ff" : "1px solid rgba(0,0,0,0.12)",
        background: isFocused 
          ? "linear-gradient(180deg, #e8f2ff 0%, #d4e5ff 40%, #c0d8ff 100%)"
          : "linear-gradient(180deg, #f5f9ff 0%, #e3ecfb 40%, #cfdbf1 100%)",
        boxShadow: isFocused
          ? "inset 0 1px 0 rgba(255,255,255,0.85), 0 2px 8px rgba(94, 160, 255, 0.3), 0 0 0 1px rgba(94, 160, 255, 0.2)"
          : "inset 0 1px 0 rgba(255,255,255,0.85), 0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs sm:text-sm font-semibold text-[#233457]">
            {title}
          </div>
          <div className="text-[10px] sm:text-xs text-[#233457]/75">{org}</div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleExpand?.();
          }}
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
              transform: (isExpanded ?? false) ? "rotate(180deg)" : "rotate(0deg)",
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
          maxHeight: (isExpanded ?? false) ? "500px" : "0",
          opacity: (isExpanded ?? false) ? 1 : 0,
        }}
      >
        <div className="pt-2 border-t border-[#233457]/20">
          <p className="text-[10px] sm:text-xs text-[#233457]/80 leading-relaxed mt-2">
            {details}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Certifications() {
  const [certificationsData, setCertificationsData] = useState<CertificationsData>({ certificates: [] });
  const [loading, setLoading] = useState(true);
  const [showFull, setShowFull] = useState(false);
  const [scale, setScale] = useState(0.96);
  const timerRef = useRef<number | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [expandedCert, setExpandedCert] = useState<string | null>(null);
  const [photoScale, setPhotoScale] = useState(0.96);
  const photoTimerRef = useRef<number | null>(null);
  const [focusedCertId, setFocusedCertId] = useState<string | null>(null);
  const focusedCertRef = useRef<HTMLDivElement | null>(null);

  // Load certifications data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getCertificationsData();
        setCertificationsData(data);
      } catch (error) {
        console.error("Error loading certifications:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!showFull) {
      // Clear focused cert when modal closes
      setFocusedCertId(null);
      return;
    }
    setScale(0.96);
    const raf = requestAnimationFrame(() => {
      setScale(1.06);
      timerRef.current = window.setTimeout(() => {
        setScale(1.0);
        timerRef.current = null;
        // Scroll to focused certificate after animation
        if (focusedCertId && focusedCertRef.current) {
          setTimeout(() => {
            focusedCertRef.current?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }, 100);
        }
      }, 120);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [showFull, focusedCertId]);

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

  const handleViewPhoto = (cert: Certificate) => {
    setSelectedCert(cert);
    setShowPhotoModal(true);
  };

  const handleToggleExpand = (certId: string) => {
    setExpandedCert(expandedCert === certId ? null : certId);
  };

  const handleCertClick = (cert: Certificate) => {
    setFocusedCertId(cert.id);
    setShowFull(true);
  };

  return (
    <>
    <Card
      title={
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2 9.5 8H3l5.5 4-2 6L12 14l5.5 4-2-6L21 8h-6.5L12 2Z" fill="currentColor"/>
          </svg>
          <span>Recent Certifications</span>
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
      className="col-span-full lg:col-span-6"
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg p-3 animate-pulse" style={{
              border: "1px solid rgba(255,255,255,0.14)",
              background: "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
              minHeight: 60,
            }}>
              <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
              <div className="h-3 w-1/2 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : (
      <div className="space-y-3">
          {certificationsData.certificates.filter((_, index) => isCertRecent(index)).map((c) => (
            <CertItem 
              key={c.id} 
              cert={c}
              onClick={() => handleCertClick(c)}
            />
          ))}
      </div>
      )}
    </Card>

      {/* Full certifications modal */}
      {showFull && (
        <div className="fixed inset-0 z-[110] grid place-items-center p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="All Certifications">
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
              }}>All Certifications</div>
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
              {loading ? (
                <div className="text-center text-white/60 py-8">Loading...</div>
              ) : (
              <div className="rounded-lg sm:rounded-xl p-3 sm:p-4 relative overflow-hidden" style={{
                background:
                  "linear-gradient(180deg, #f5f9ff 0%, #e3ecfb 40%, #cfdbf1 100%)",
                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
              }}>
                <div className="space-y-2 sm:space-y-3">
                    {certificationsData.certificates.map((c) => (
                    <CertItem 
                        key={c.id} 
                        cert={c}
                      isModal={true}
                      isFocused={focusedCertId === c.id}
                      innerRef={focusedCertId === c.id ? (node) => { focusedCertRef.current = node; } : undefined}
                      onViewPhoto={() => handleViewPhoto(c)}
                        isExpanded={expandedCert === c.id}
                        onToggleExpand={() => handleToggleExpand(c.id)}
                    />
                  ))}
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {showPhotoModal && selectedCert && (
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
              }}>{selectedCert.title}</div>
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
            <div className="px-2 pb-2 pt-2 sm:px-6 sm:pb-6 sm:pt-4 h-[calc(100%-60px)] sm:h-[calc(100%-80px)] flex items-center justify-center bg-[#1a1a1a]">
              {selectedCert?.imageUrl ? (
                <div className="w-full h-full flex items-center justify-center rounded-lg sm:rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={selectedCert.imageUrl} 
                    alt={selectedCert.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
              <div className="w-full h-full flex items-center justify-center rounded-lg sm:rounded-xl overflow-hidden" style={{
                background: "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)",
                border: "2px dashed rgba(255,255,255,0.2)",
              }}>
                <div className="text-center p-4 sm:p-8">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3 sm:mb-4 opacity-50 sm:w-16 sm:h-16" style={{ color: "#808a99" }}>
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
                  </svg>
                  <p className="text-white/60 text-xs sm:text-sm">Certificate Photo</p>
                    <p className="text-white/40 text-[10px] sm:text-xs mt-1 sm:mt-2">No image available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
