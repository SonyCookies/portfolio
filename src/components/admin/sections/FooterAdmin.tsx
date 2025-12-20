"use client";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { getFooterData, saveFooterData, type FooterData } from "@/lib/footer-data";
import { showToast, updateToast, removeToast } from "@/components/ui/Toast";

export default function FooterAdmin() {
  const [footerData, setFooterData] = useState<FooterData>({
    copyrightName: "Sonny Sarcia",
    techStack: "Coded from scratch using Next.js and Tailwind CSS.",
    credits: "Layout inspiration from Bryl Lim. Design heavily influenced by Clash Royale.",
  });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editScale, setEditScale] = useState(0.96);
  const editTimerRef = useRef<number | null>(null);

  // Form state for editing
  const [formData, setFormData] = useState<FooterData>(footerData);

  // Load footer data from Firebase on mount
  useEffect(() => {
    const loadFooterData = async () => {
      try {
        setLoading(true);
        console.log("[FooterAdmin] Loading data from Firebase...");
        const data = await getFooterData();
        console.log("[FooterAdmin] Data loaded:", {
          copyrightName: data.copyrightName,
          techStack: data.techStack,
          credits: data.credits,
        });
        setFooterData(data);
        setFormData(data);
      } catch (error) {
        console.error("[FooterAdmin] Error loading footer data:", error);
      } finally {
        setLoading(false);
        console.log("[FooterAdmin] Loading complete");
      }
    };

    loadFooterData();
  }, []);

  // Edit modal scale animation
  useEffect(() => {
    if (!showEditModal) return;
    setEditScale(0.96);
    const raf = requestAnimationFrame(() => {
      setEditScale(1.06);
      editTimerRef.current = window.setTimeout(() => {
        setEditScale(1.0);
        editTimerRef.current = null;
      }, 120);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (editTimerRef.current) {
        clearTimeout(editTimerRef.current);
        editTimerRef.current = null;
      }
    };
  }, [showEditModal]);

  useEffect(() => {
    if (showEditModal) {
      setFormData(footerData);
    }
  }, [showEditModal, footerData]);

  const handleSave = async () => {
    setShowEditModal(false);
    
    const toastId = showToast("Saving changes...", "loading", 0);

    try {
      updateToast(toastId, { message: "Saving to database...", progress: 95 });
      await saveFooterData(formData);
      setFooterData(formData);
      
      updateToast(toastId, { 
        message: "Changes saved successfully!", 
        type: "success",
        progress: 100
      });
    } catch (error) {
      console.error("Error saving:", error);
      removeToast(toastId);
      showToast(
        error instanceof Error ? error.message : "Failed to save changes. Please try again.",
        "error"
      );
    }
  };

  const handleCancel = () => {
    setFormData(footerData);
    setShowEditModal(false);
  };

  const year = new Date().getFullYear();

  // Parse tech stack to extract technology names for styling
  const parseTechStack = (text: string): ReactNode => {
    const techNames = ["Next.js", "Tailwind CSS", "React", "TypeScript", "Python", "FastAPI"];
    const parts: (string | ReactNode)[] = [];
    let lastIndex = 0;
    let key = 0;

    techNames.forEach(tech => {
      const regex = new RegExp(`(${tech})`, "gi");
      const match = regex.exec(text);
      if (match && match.index !== undefined) {
        // Add text before match
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        // Add styled tech name
        parts.push(
          <span key={key++} className="font-semibold text-white">
            {match[1]}
          </span>
        );
        lastIndex = match.index + match[0].length;
      }
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  if (loading) {
    return (
      <footer className="col-span-full relative">
        {/* Edit Button Skeleton */}
        <div
          className="absolute -top-2 -right-2 z-30 p-2 rounded-lg bg-yellow-400/50 animate-pulse"
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div className="w-5 h-5 bg-gray-900/20 rounded" />
        </div>
        <div className="h-px w-full" style={{
          background: "linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
        }} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 items-start">
          <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
          <div className="h-8 w-64 bg-white/10 rounded animate-pulse ml-auto" />
        </div>
      </footer>
    );
  }

  return (
    <>
      <footer className="col-span-full relative">
        {/* Edit Button */}
        <button
          onClick={() => setShowEditModal(true)}
          className="absolute -top-2 -right-2 z-30 p-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-lg transition-colors"
          title="Edit Footer Section"
          aria-label="Edit Footer Section"
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="h-px w-full" style={{
          background: "linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
        }} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 items-start">
          <div className="text-sm text-white/80">
            © {year} <span className="font-semibold text-white">{footerData.copyrightName}</span>. All rights reserved.
          </div>
          <div className="text-right text-sm">
            <div className="text-white/85">{parseTechStack(footerData.techStack)}</div>
            <div className="text-white/60 text-xs">{footerData.credits}</div>
          </div>
        </div>
      </footer>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[200] grid place-items-center p-1 sm:p-4" role="dialog" aria-modal="true" aria-label="Edit Footer Section">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />
          <div 
            className="relative z-[201] w-full max-w-[98vw] sm:max-w-[700px] h-[98vh] sm:h-auto sm:max-h-[95vh] rounded-[12px] sm:rounded-[24px] overflow-hidden flex flex-col"
            style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
              boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
              transform: `scale(${editScale})`,
              transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
            }}
          >
            {/* Header */}
            <div className="relative flex items-center px-3 py-2.5 sm:px-6 sm:py-6 flex-shrink-0" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            }}>
              <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide text-[9px] sm:text-sm px-2 text-center max-w-[calc(100%-70px)] truncate" style={{
                textTransform: "uppercase",
                textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45), -1px -1px 0 #1c2744, 1px -1px 0 #1c2744, -1px 1px 0 #1c2744, 1px 1px 0 #1c2744",
                letterSpacing: 1,
              }}>Edit Footer</div>
              <button 
                type="button" 
                onClick={handleCancel} 
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

            {/* Inner content container area */}
            <div className="px-2 sm:px-4 pb-3 sm:pb-6 pt-1 sm:pt-2 flex-1 flex flex-col min-h-0 overflow-y-auto" style={{
              background: "linear-gradient(360deg, #808a99 0%, #6b7586 100%)"
            }}>
              {/* Content panel wrapper */}
              <div className="mt-2 sm:mt-4 rounded-xl flex-1 min-h-0 overflow-y-auto" style={{
                background: "linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%)",
                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                padding: "8px",
              }}>
                <div className="space-y-3 sm:space-y-4">
                  {/* Copyright Name Field */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#233457] mb-1.5">
                      Copyright Name
                    </label>
                    <input
                      type="text"
                      value={formData.copyrightName}
                      onChange={(e) => setFormData({ ...formData, copyrightName: e.target.value })}
                      className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                      placeholder="Enter copyright name"
                    />
                    <p className="text-[10px] sm:text-xs text-[#233457]/60 mt-1">
                      This will appear as: © {year} <strong>{formData.copyrightName || "Your Name"}</strong>. All rights reserved.
                    </p>
                  </div>

                  {/* Tech Stack Field */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#233457] mb-1.5">
                      Tech Stack Description
                    </label>
                    <textarea
                      value={formData.techStack}
                      onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                      className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                      placeholder="e.g., Coded from scratch using Next.js and Tailwind CSS."
                      rows={2}
                      style={{ resize: "vertical" }}
                    />
                    <p className="text-[10px] sm:text-xs text-[#233457]/60 mt-1">
                      Technologies like "Next.js" and "Tailwind CSS" will be automatically styled in bold.
                    </p>
                  </div>

                  {/* Credits Field */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#233457] mb-1.5">
                      Credits
                    </label>
                    <textarea
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                      className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                      placeholder="e.g., Layout inspiration from Bryl Lim. Design heavily influenced by Clash Royale."
                      rows={2}
                      style={{ resize: "vertical" }}
                    />
                    <p className="text-[10px] sm:text-xs text-[#233457]/60 mt-1">
                      Attribution and design credits.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-[#233457]/20 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-white active:translate-y-0.5 transition cr-glass-hover flex-1"
                    style={{
                      border: "1px solid color-mix(in oklab, var(--accent) 55%, #8f6a12 45%)",
                      background: "linear-gradient(180deg, color-mix(in oklab, var(--accent) 92%, white 6%), color-mix(in oklab, var(--accent) 70%, #b68b1a 30%))",
                      boxShadow: "inset 0 2px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-white active:translate-y-0.5 transition cr-glass-hover flex-1"
                    style={{
                      border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                      background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

