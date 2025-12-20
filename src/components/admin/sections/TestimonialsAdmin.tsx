"use client";
import { useState, useEffect, useRef } from "react";
import Card from "@/components/ui/Card";
import { getTestimonialsData, saveTestimonialsData, type TestimonialsData, type Testimonial } from "@/lib/testimonials-data";
import { showToast, updateToast, removeToast } from "@/components/ui/Toast";

export default function TestimonialsAdmin() {
  const [testimonialsData, setTestimonialsData] = useState<TestimonialsData>({ testimonials: [] });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editScale, setEditScale] = useState(0.96);
  const editTimerRef = useRef<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalScale, setDeleteModalScale] = useState(0.96);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteTimerRef = useRef<number | null>(null);
  const [isRearrangeMode, setIsRearrangeMode] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  // Form state for editing
  const [formData, setFormData] = useState<TestimonialsData>(testimonialsData);

  // Load testimonials data from Firebase on mount
  useEffect(() => {
    const loadTestimonialsData = async () => {
      try {
        setLoading(true);
        console.log("[TestimonialsAdmin] Loading data from Firebase...");
        const data = await getTestimonialsData();
        console.log("[TestimonialsAdmin] Data loaded:", {
          testimonialsCount: data.testimonials?.length || 0,
        });
        setTestimonialsData(data);
        setFormData(data);
      } catch (error) {
        console.error("[TestimonialsAdmin] Error loading testimonials data:", error);
      } finally {
        setLoading(false);
        console.log("[TestimonialsAdmin] Loading complete");
      }
    };

    loadTestimonialsData();
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

  // Delete modal scale animation
  useEffect(() => {
    if (!showDeleteModal) return;
    setDeleteModalScale(0.96);
    const raf = requestAnimationFrame(() => {
      setDeleteModalScale(1.06);
      deleteTimerRef.current = window.setTimeout(() => {
        setDeleteModalScale(1.0);
        deleteTimerRef.current = null;
      }, 120);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
        deleteTimerRef.current = null;
      }
    };
  }, [showDeleteModal]);

  useEffect(() => {
    if (showEditModal) {
      setFormData(testimonialsData);
      setIsRearrangeMode(false);
    }
  }, [showEditModal, testimonialsData]);

  const handleSave = async () => {
    setShowEditModal(false);
    
    const toastId = showToast("Saving changes...", "loading", 0);

    try {
      updateToast(toastId, { message: "Saving to database...", progress: 95 });
      await saveTestimonialsData(formData);
      setTestimonialsData(formData);
      
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
    setFormData(testimonialsData);
    setShowEditModal(false);
    setIsRearrangeMode(false);
  };

  const handleAddTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: `testimonial-${Date.now()}`,
      quote: "",
      author: "",
    };
    setFormData({
      ...formData,
      testimonials: [newTestimonial, ...formData.testimonials],
    });
  };

  const handleTestimonialChange = (id: string, field: keyof Testimonial, value: string) => {
    setFormData({
      ...formData,
      testimonials: formData.testimonials.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      ),
    });
  };

  const handleDeleteTestimonial = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;

    setFormData({
      ...formData,
      testimonials: formData.testimonials.filter((t) => t.id !== deleteId),
    });

    setShowDeleteModal(false);
    setDeleteId(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedItemId !== id) {
      setDragOverItemId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverItemId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetId) {
      setDraggedItemId(null);
      setDragOverItemId(null);
      return;
    }

    const testimonials = [...formData.testimonials];
    const draggedIndex = testimonials.findIndex((t) => t.id === draggedItemId);
    const targetIndex = testimonials.findIndex((t) => t.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItemId(null);
      setDragOverItemId(null);
      return;
    }

    const [draggedItem] = testimonials.splice(draggedIndex, 1);
    testimonials.splice(targetIndex, 0, draggedItem);

    setFormData({
      ...formData,
      testimonials,
    });

    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  if (loading) {
    return (
      <div className="col-span-full lg:col-span-6 relative">
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
                <path d="M6 6h12v12H6z" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 9h8M8 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Testimonials</span>
            </>
          }
          className="col-span-full lg:col-span-6"
        >
          <div className="min-h-[96px] animate-pulse">
            <div className="h-4 w-full bg-white/10 rounded mb-2" />
            <div className="h-4 w-3/4 bg-white/10 rounded mb-4" />
            <div className="h-3 w-1/3 bg-white/10 rounded" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="col-span-full lg:col-span-6 relative">
        {/* Edit Button */}
        <button
          onClick={() => setShowEditModal(true)}
          className="absolute -top-2 -right-2 z-30 p-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-lg transition-colors"
          title="Edit Testimonials Section"
          aria-label="Edit Testimonials Section"
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* Testimonials Component UI */}
        <Card
          title={
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6h12v12H6z" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 9h8M8 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Testimonials</span>
            </>
          }
          className="col-span-full lg:col-span-6"
        >
          <div className="min-h-[96px]">
            {testimonialsData.testimonials.length > 0 ? (
              <>
                <blockquote className="text-white/85 leading-relaxed">"{testimonialsData.testimonials[0].quote}"</blockquote>
                <div className="mt-4 text-xs sm:text-sm text-white/60">{testimonialsData.testimonials[0].author}</div>
              </>
            ) : (
              <div className="text-white/60 text-sm">No testimonials available</div>
            )}
          </div>
        </Card>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[200] grid place-items-center p-1 sm:p-4" role="dialog" aria-modal="true" aria-label="Edit Testimonials Section">
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
              }}>Edit Testimonials</div>
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
                  {/* Rearrange Button */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsRearrangeMode(!isRearrangeMode)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-semibold text-white active:translate-y-0.5 transition cr-glass-hover"
                        style={{
                          border: "1px solid color-mix(in oklab, var(--accent) 35%, white 10%)",
                          background: isRearrangeMode
                            ? "linear-gradient(180deg, color-mix(in oklab, var(--accent) 92%, white 6%), color-mix(in oklab, var(--accent) 70%, #b68b1a 30%))"
                            : "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{isRearrangeMode ? "Done Rearranging" : "Rearrange"}</span>
                      </button>
                    </div>
                    {!isRearrangeMode && (
                      <button
                        type="button"
                        onClick={handleAddTestimonial}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-semibold text-white active:translate-y-0.5 transition cr-glass-hover w-full sm:w-auto"
                        style={{
                          border: "1px solid color-mix(in oklab, #10b981 35%, white 10%)",
                          background: "linear-gradient(180deg, #10b981 0%, #059669 60%, #047857 100%)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Add Testimonial</span>
                      </button>
                    )}
                  </div>

                  {/* Testimonials List */}
                  <div className="space-y-3 sm:space-y-4">
                    {formData.testimonials.map((testimonial, index) => (
                      <div
                        key={testimonial.id}
                        draggable={isRearrangeMode}
                        onDragStart={(e) => handleDragStart(e, testimonial.id)}
                        onDragOver={(e) => handleDragOver(e, testimonial.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, testimonial.id)}
                        onDragEnd={handleDragEnd}
                        className={`rounded-lg p-2.5 sm:p-4 border border-[#233457]/20 bg-white/50 relative ${
                          isRearrangeMode ? "cursor-move" : ""
                        } ${
                          draggedItemId === testimonial.id ? "opacity-50" : ""
                        } ${
                          dragOverItemId === testimonial.id ? "border-[#5ea0ff] border-2" : ""
                        }`}
                      >
                        {isRearrangeMode ? (
                          <>
                            {/* Rearrange Mode - Collapsed View */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 text-[#233457]/60">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                                  <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span className="text-xs font-semibold">#{index + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs sm:text-sm font-semibold text-[#233457] truncate">{testimonial.quote.substring(0, 50) || "Untitled Testimonial"}...</div>
                                <div className="text-[10px] sm:text-xs text-[#233457]/60">{testimonial.author || "No author"}</div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Normal Mode - Full Edit Form */}
                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteTestimonial(testimonial.id)}
                              className="absolute top-2 right-2 p-1.5 rounded-md text-white hover:bg-red-600 transition-colors"
                              style={{
                                background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 55%, #b73838 100%)",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 4px rgba(0,0,0,0.2)",
                              }}
                              aria-label="Delete testimonial"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>

                            {/* Quote */}
                            <div className="mb-3 sm:mb-4 pr-10">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Quote
                              </label>
                              <textarea
                                value={testimonial.quote}
                                onChange={(e) => handleTestimonialChange(testimonial.id, "quote", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="Testimonial quote"
                                rows={4}
                                style={{ resize: "vertical" }}
                              />
                            </div>

                            {/* Author */}
                            <div className="mb-3 sm:mb-4">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Author
                              </label>
                              <input
                                type="text"
                                value={testimonial.author}
                                onChange={(e) => handleTestimonialChange(testimonial.id, "author", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="— at"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {(!formData.testimonials || formData.testimonials.length === 0) && (
                      <div className="text-center py-8 text-[#233457]/60 text-xs sm:text-sm">
                        No testimonials yet. Click &quot;Add Testimonial&quot; to add one.
                      </div>
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
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[210] grid place-items-center p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="Delete Confirmation">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative z-[211] w-full max-w-[min(90vw,480px)] rounded-[16px] sm:rounded-[24px] overflow-hidden" style={{
            background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
            transform: `scale(${deleteModalScale})`,
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
                Delete Testimonial
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
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
            <div className="px-4 pb-6 pt-4" style={{
              background: "linear-gradient(360deg, #808a99 0%, #6b7586 100%)"
            }}>
              <div className="rounded-xl p-4 mb-4" style={{
                background: "linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%)",
                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
              }}>
                <p className="text-xs sm:text-sm text-[#233457] text-center font-semibold">
                  Are you sure you want to delete this testimonial? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteId(null);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-white active:translate-y-0.5 transition cr-glass-hover flex-1"
                  style={{
                    border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                    background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                  }}
                >
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-white active:translate-y-0.5 transition cr-glass-hover flex-1"
                  style={{
                    border: "1px solid color-mix(in oklab, #ff6b6b 35%, white 10%)",
                    background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 60%, #b73838 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
