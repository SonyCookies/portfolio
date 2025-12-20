"use client";
import { useState, useEffect, useRef } from "react";
import Card from "@/components/ui/Card";
import { getBeyondCodingData, saveBeyondCodingData, type BeyondCodingData } from "@/lib/beyondcoding-data";
import { showToast, updateToast, removeToast } from "@/components/ui/Toast";

export default function BeyondCodingAdmin() {
  const [beyondCodingData, setBeyondCodingData] = useState<BeyondCodingData>({
    description: "",
    interests: [],
  });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editScale, setEditScale] = useState(0.96);
  const editTimerRef = useRef<number | null>(null);
  const [interestInput, setInterestInput] = useState("");

  // Form state for editing
  const [formData, setFormData] = useState<BeyondCodingData>(beyondCodingData);

  // Load beyond coding data from Firebase on mount
  useEffect(() => {
    const loadBeyondCodingData = async () => {
      try {
        setLoading(true);
        console.log("[BeyondCodingAdmin] Loading data from Firebase...");
        const data = await getBeyondCodingData();
        console.log("[BeyondCodingAdmin] Data loaded:", {
          hasDescription: !!data.description,
          interestsCount: data.interests?.length || 0,
        });
        setBeyondCodingData(data);
        setFormData(data);
      } catch (error) {
        console.error("[BeyondCodingAdmin] Error loading beyond coding data:", error);
      } finally {
        setLoading(false);
        console.log("[BeyondCodingAdmin] Loading complete");
      }
    };

    loadBeyondCodingData();
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
      setFormData(beyondCodingData);
      setInterestInput("");
    }
  }, [showEditModal, beyondCodingData]);

  const handleSave = async () => {
    setShowEditModal(false);
    
    const toastId = showToast("Saving changes...", "loading", 0);

    try {
      updateToast(toastId, { message: "Saving to database...", progress: 95 });
      await saveBeyondCodingData(formData);
      setBeyondCodingData(formData);
      
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
    setFormData(beyondCodingData);
    setShowEditModal(false);
    setInterestInput("");
  };

  const handleAddInterests = () => {
    if (!interestInput.trim()) return;

    // Split by comma and trim each item
    const items = interestInput
      .split(",")
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (items.length === 0) return;

    setFormData({
      ...formData,
      interests: [...formData.interests, ...items],
    });
    setInterestInput("");
  };

  const handleDeleteInterest = (index: number) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((_, i) => i !== index),
    });
  };

  // Show loading state if data not loaded
  if (loading || !beyondCodingData) {
    return (
      <div className="col-span-full lg:col-span-4 xl:col-span-4 relative">
        {/* Edit Button Skeleton */}
        <div
          className="absolute -top-2 -right-2 z-30 p-2 rounded-lg bg-yellow-400/50 animate-pulse"
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div className="w-5 h-5 bg-gray-900/20 rounded" />
        </div>
        <Card
          title={
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 3l2.2 4.46 4.92.72-3.56 3.47.84 4.9L12 14.9l-4.4 2.3.84-4.9L4.88 8.18l4.92-.72L12 3Z" fill="currentColor"/>
              </svg>
              <span>Beyond Coding</span>
            </>
          }
          className="col-span-full lg:col-span-4 xl:col-span-4"
        >
          <div className="space-y-3">
            <div className="rounded-xl p-3 relative overflow-hidden animate-pulse" style={{
              background: "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
              border: "1px solid rgba(255,255,255,0.12)",
              minHeight: 80,
            }}>
              <div className="h-4 w-full bg-white/10 rounded mb-2" />
              <div className="h-4 w-5/6 bg-white/10 rounded mb-2" />
              <div className="h-4 w-4/6 bg-white/10 rounded" />
            </div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="col-span-full lg:col-span-4 xl:col-span-4 relative">
        {/* Edit Button */}
        <button
          onClick={() => setShowEditModal(true)}
          className="absolute -top-2 -right-2 z-30 p-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-lg transition-colors"
          title="Edit Beyond Coding Section"
          aria-label="Edit Beyond Coding Section"
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* BeyondCoding Component UI */}
        <Card
          title={
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 3l2.2 4.46 4.92.72-3.56 3.47.84 4.9L12 14.9l-4.4 2.3.84-4.9L4.88 8.18l4.92-.72L12 3Z" fill="currentColor"/>
              </svg>
              <span>Beyond Coding</span>
            </>
          }
          className="col-span-full lg:col-span-4 xl:col-span-4"
        >
          <div className="space-y-3">
            <div
              className="rounded-xl p-3 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
              }}
            >
              <div className="text-white/85 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {beyondCodingData.description || "No description available yet."}
              </div>
              <div aria-hidden className="pointer-events-none absolute left-2 right-2 top-1 h-1 rounded-full" style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.03))",
              }} />
            </div>
            <div className="flex flex-wrap gap-2">
              {beyondCodingData.interests.length === 0 ? (
                <div className="text-white/60 text-[10px] sm:text-xs">No interests available yet.</div>
              ) : (
                beyondCodingData.interests.map((t) => (
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
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[200] grid place-items-center p-1 sm:p-4" role="dialog" aria-modal="true" aria-label="Edit Beyond Coding Section">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />
          <div 
            className="relative z-[201] w-full max-w-[98vw] sm:max-w-[900px] lg:max-w-[1000px] h-[98vh] sm:h-auto sm:max-h-[95vh] rounded-[12px] sm:rounded-[24px] overflow-hidden flex flex-col"
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
              }}>Edit Beyond Coding</div>
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
                  {/* Description Field */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#233457] mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                      placeholder="Enter your description..."
                      rows={6}
                      style={{ resize: "vertical" }}
                    />
                    <p className="text-[10px] sm:text-xs text-[#233457]/60 mt-1">
                      You can use line breaks to format your content.
                    </p>
                  </div>

                  {/* Interests Section */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#233457] mb-1.5">
                      Interests
                    </label>
                    <div className="mb-2 flex gap-2">
                      <input
                        type="text"
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAddInterests();
                          }
                        }}
                        className="flex-1 px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                        placeholder="Enter interests, separated by commas"
                      />
                      <button
                        type="button"
                        onClick={handleAddInterests}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-semibold text-white active:translate-y-0.5 transition cr-glass-hover"
                        style={{
                          border: "1px solid color-mix(in oklab, #5ea0ff 35%, white 10%)",
                          background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="hidden sm:inline">Add</span>
                      </button>
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#233457]/60 mb-2">
                      Enter multiple interests separated by commas. Press Enter or click Add.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.length === 0 ? (
                        <div className="text-[10px] sm:text-xs text-[#233457]/60">No interests yet.</div>
                      ) : (
                        formData.interests.map((interest, index) => (
                          <div key={index} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold text-black" style={{
                            border: "1px solid color-mix(in oklab, var(--accent) 55%, #8f6a12 45%)",
                            background: "linear-gradient(180deg, color-mix(in oklab, var(--accent) 92%, white 6%), color-mix(in oklab, var(--accent) 70%, #b68b1a 30%))",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.35)",
                          }}>
                            {interest}
                            <button
                              type="button"
                              onClick={() => handleDeleteInterest(index)}
                              className="ml-1 hover:opacity-70"
                              title="Remove"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
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
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
