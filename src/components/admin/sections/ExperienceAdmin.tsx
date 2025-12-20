"use client";
import { useState, useEffect, useRef } from "react";
import { getExperienceData, saveExperienceData, type ExperienceData, type ExperienceItem } from "@/lib/experience-data";
import { showToast, updateToast, removeToast } from "@/components/ui/Toast";
import Card from "@/components/ui/Card";

function PeriodPill({ start, end }: { start: string; end?: string }) {
  const text = end ? `${start}  —  ${end}` : start;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] text-black font-extrabold"
      style={{
        border: "1px solid color-mix(in oklab, var(--accent) 55%, #8f6a12 45%)",
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--accent) 92%, white 6%), color-mix(in oklab, var(--accent) 70%, #b68b1a 30%))",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.35)",
      }}
    >
      {text}
    </span>
  );
}

function TimelineContent({ timeline }: { timeline: ExperienceItem[] }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-white/60 text-xs sm:text-sm">
        No experience items available yet.
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* vertical line */}
      <div className="absolute left-3 top-0 bottom-0" aria-hidden>
        <div className="h-full w-px"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
          }}
        />
      </div>
      <ol className="space-y-5">
        {timeline.map((item) => (
          <li key={item.id} className="relative pl-8 group">
            {/* node */}
            <span
              className="absolute left-2 top-1.5 h-3.5 w-3.5 rounded-full transition-transform duration-200 group-hover:scale-110"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #fff 0%, #d1d5db 25%, #9ca3af 55%, rgba(0,0,0,0.2) 100%)",
                boxShadow: "0 0 0 2px rgba(255,255,255,0.16), 0 2px 8px rgba(0,0,0,0.45)",
              }}
              aria-hidden
            />
            {/* hover glow halo */}
            <span
              aria-hidden
              className="absolute left-1 top-0 h-6 w-6 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--accent) 85%, white 10%) 0%, rgba(242,201,76,0.45) 45%, rgba(242,201,76,0.05) 75%, transparent 100%)",
                filter: "saturate(1.2)",
              }}
            />

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-white/95">{item.role}</div>
                <div className="text-xs sm:text-sm text-white/70">{item.org}</div>
              </div>
              <div className="shrink-0"><PeriodPill start={item.start} end={item.end} /></div>
            </div>

            {item.awards && item.awards.length > 0 && (
              <ul className="mt-2 space-y-1 text-[12px] text-amber-300/90">
                {item.awards.map((a) => (
                  <li key={a} className="pl-1" style={{ textShadow: "0 1px 0 rgba(0,0,0,0.35)" }}>
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function ExperienceAdmin() {
  const [experienceData, setExperienceData] = useState<ExperienceData>({
    items: [],
  });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editScale, setEditScale] = useState(0.96);
  const editTimerRef = useRef<number | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [isRearrangeMode, setIsRearrangeMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalScale, setDeleteModalScale] = useState(0.96);
  const [deleteType, setDeleteType] = useState<"experience" | "award" | null>(null);
  const [deleteData, setDeleteData] = useState<{ experienceId?: string; awardIndex?: number } | null>(null);
  const deleteTimerRef = useRef<number | null>(null);

  // Form state for editing
  const [formData, setFormData] = useState<ExperienceData>(experienceData);

  // Load experience data from Firebase on mount
  useEffect(() => {
    const loadExperienceData = async () => {
      try {
        setLoading(true);
        console.log("[ExperienceAdmin] Loading data from Firebase...");
        const data = await getExperienceData();
        console.log("[ExperienceAdmin] Data loaded:", {
          itemsCount: data.items?.length || 0,
        });
        setExperienceData(data);
        setFormData(data);
      } catch (error) {
        console.error("[ExperienceAdmin] Error loading experience data:", error);
      } finally {
        setLoading(false);
        console.log("[ExperienceAdmin] Loading complete");
      }
    };

    loadExperienceData();
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
      setFormData(experienceData);
      setIsRearrangeMode(false); // Reset rearrange mode when opening modal
    }
  }, [showEditModal, experienceData]);

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

  const handleSave = async () => {
    setShowEditModal(false);
    
    const toastId = showToast("Saving changes...", "loading", 0);

    try {
      updateToast(toastId, { message: "Saving to database...", progress: 95 });
      await saveExperienceData(formData);
      setExperienceData(formData);
      
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
    setFormData(experienceData);
    setIsRearrangeMode(false); // Reset rearrange mode on cancel
    setShowEditModal(false);
  };

  const handleAddExperience = () => {
    const newItem: ExperienceItem = {
      id: `exp-${Date.now()}`,
      role: "",
      org: "",
      start: "",
      end: "",
      awards: [],
    };
    setFormData({
      ...formData,
      items: [newItem, ...formData.items],
    });
  };

  const handleDeleteExperience = (id: string) => {
    setDeleteType("experience");
    setDeleteData({ experienceId: id });
    setShowDeleteModal(true);
  };

  const handleExperienceChange = (id: string, field: keyof ExperienceItem, value: string | string[]) => {
    const updated = formData.items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, items: updated });
  };

  const handleAddAward = (id: string) => {
    const updated = formData.items.map((item) =>
      item.id === id
        ? { ...item, awards: [...(item.awards || []), ""] }
        : item
    );
    setFormData({ ...formData, items: updated });
  };

  const handleDeleteAward = (id: string, awardIndex: number) => {
    setDeleteType("award");
    setDeleteData({ experienceId: id, awardIndex });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteType || !deleteData) return;

    if (deleteType === "experience" && deleteData.experienceId) {
      setFormData({
        ...formData,
        items: formData.items.filter((item) => item.id !== deleteData.experienceId),
      });
    } else if (deleteType === "award" && deleteData.experienceId !== undefined && deleteData.awardIndex !== undefined) {
      const updated = formData.items.map((item) =>
        item.id === deleteData.experienceId
          ? { ...item, awards: item.awards?.filter((_, i) => i !== deleteData.awardIndex) || [] }
          : item
      );
      setFormData({ ...formData, items: updated });
    }

    setShowDeleteModal(false);
    setDeleteType(null);
    setDeleteData(null);
  };

  const handleAwardChange = (id: string, awardIndex: number, value: string) => {
    const updated = formData.items.map((item) =>
      item.id === id
        ? {
            ...item,
            awards: item.awards?.map((a, i) => (i === awardIndex ? value : a)) || [],
          }
        : item
    );
    setFormData({ ...formData, items: updated });
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", itemId);
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedItemId && draggedItemId !== itemId) {
      setDragOverItemId(itemId);
    }
  };

  const handleDragLeave = () => {
    setDragOverItemId(null);
  };

  const handleDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    setDragOverItemId(null);

    if (!draggedItemId || draggedItemId === targetItemId) {
      setDraggedItemId(null);
      return;
    }

    const items = [...formData.items];
    const draggedIndex = items.findIndex((item) => item.id === draggedItemId);
    const targetIndex = items.findIndex((item) => item.id === targetItemId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItemId(null);
      return;
    }

    // Remove dragged item and insert at target position
    const [draggedItem] = items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, draggedItem);

    setFormData({ ...formData, items });
    setDraggedItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  // Show loading state if data not loaded
  if (loading || !experienceData) {
    return (
      <div className="col-span-full lg:col-span-5 xl:col-span-4 relative">
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
                <path d="M9 4a2 2 0 0 0-2 2H5.75A2.75 2.75 0 0 0 3 8.75v7.5A2.75 2.75 0 0 0 5.75 19h12.5A2.75 2.75 0 0 0 21 16.25v-7.5A2.75 2.75 0 0 0 18.25 6H17a2 2 0 0 0-2-2H9Zm2 2h2a1 1 0 0 1 1 1H10a1 1 0 0 1 1-1Z" fill="currentColor"/>
              </svg>
              <span>Experience</span>
            </>
          }
          className="col-span-full lg:col-span-5 xl:col-span-4 h-full flex flex-col"
        >
          {/* Timeline Skeleton */}
          <div className="relative h-full">
            {/* Vertical line skeleton */}
            <div className="absolute left-3 top-0 bottom-0" aria-hidden>
              <div className="h-full w-px bg-white/10 animate-pulse" />
            </div>
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative pl-8">
                  {/* Node skeleton */}
                  <div
                    className="absolute left-2 top-1.5 h-3.5 w-3.5 rounded-full bg-white/20 animate-pulse"
                    style={{
                      boxShadow: "0 0 0 2px rgba(255,255,255,0.16)",
                    }}
                    aria-hidden
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {/* Role skeleton */}
                      <div className="h-4 w-32 bg-white/20 rounded animate-pulse mb-2" />
                      {/* Organization skeleton */}
                      <div className="h-3 w-24 bg-white/15 rounded animate-pulse" />
                    </div>
                    {/* Date pill skeleton */}
                    <div className="h-5 w-20 bg-white/20 rounded-full animate-pulse shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="col-span-full lg:col-span-5 xl:col-span-4 relative">
        {/* Edit Button */}
        <button
          onClick={() => setShowEditModal(true)}
          className="absolute -top-2 -right-2 z-30 p-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-lg transition-colors"
          title="Edit Experience Section"
          aria-label="Edit Experience Section"
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <Card
          title={
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M9 4a2 2 0 0 0-2 2H5.75A2.75 2.75 0 0 0 3 8.75v7.5A2.75 2.75 0 0 0 5.75 19h12.5A2.75 2.75 0 0 0 21 16.25v-7.5A2.75 2.75 0 0 0 18.25 6H17a2 2 0 0 0-2-2H9Zm2 2h2a1 1 0 0 1 1 1H10a1 1 0 0 1 1-1Z" fill="currentColor"/>
              </svg>
              <span>Experience</span>
            </>
          }
          action={
            <button
              type="button"
              onClick={() => {}}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-semibold text-white active:translate-y-0.5 transition cr-glass-hover"
              style={{
                border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                background:
                  "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
              }}
              title="View full"
            >
              <span>View full</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          }
          className="col-span-full lg:col-span-5 xl:col-span-4 h-full flex flex-col"
        >
          <TimelineContent timeline={experienceData.items} />
        </Card>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[200] grid place-items-center p-1 sm:p-4" role="dialog" aria-modal="true" aria-label="Edit Experience Section">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />
          <div className="relative z-[201] w-full max-w-[98vw] sm:max-w-[900px] lg:max-w-[1000px] h-[98vh] sm:h-auto sm:max-h-[95vh] rounded-[12px] sm:rounded-[24px] overflow-hidden flex flex-col" style={{
            background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
            transform: `scale(${editScale})`,
            transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
          }}>
            <div className="relative flex items-center px-3 py-2.5 sm:px-6 sm:py-6 flex-shrink-0" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            }}>
              <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide text-[9px] sm:text-sm px-2 text-center max-w-[calc(100%-70px)] truncate" style={{
                textTransform: "uppercase",
                textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45), -1px -1px 0 #1c2744, 1px -1px 0 #1c2744, -1px 1px 0 #1c2744, 1px 1px 0 #1c2744",
                letterSpacing: 1,
              }}>Edit Experience</div>
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
              <div className="mt-2 sm:mt-4 rounded-xl flex-1 min-h-0 overflow-y-auto flex flex-col" style={{
                background: "linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%)",
                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                padding: "8px",
              }}>
                <div className="space-y-3 sm:space-y-4 flex-1 min-h-0 overflow-y-auto">
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <button
                      type="button"
                      onClick={() => setIsRearrangeMode(!isRearrangeMode)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-semibold text-white active:translate-y-0.5 transition cr-glass-hover ${
                        isRearrangeMode ? "w-full sm:w-auto" : ""
                      }`}
                      style={isRearrangeMode ? {
                        border: "1px solid color-mix(in oklab, #f59e0b 35%, white 10%)",
                        background: "linear-gradient(180deg, #f59e0b 0%, #d97706 60%, #b45309 100%)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                      } : {
                        border: "1px solid color-mix(in oklab, #5ea0ff 35%, white 10%)",
                        background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{isRearrangeMode ? "Exit Rearrange" : "Rearrange"}</span>
                    </button>
                    {!isRearrangeMode && (
                      <button
                        type="button"
                        onClick={handleAddExperience}
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
                        <span>Add Experience</span>
                      </button>
                    )}
                  </div>

                  {/* Experience Items */}
                  <div className="space-y-3 sm:space-y-4">
                    {formData.items.map((item, index) => (
                      <div
                        key={item.id}
                        draggable={isRearrangeMode}
                        onDragStart={(e) => isRearrangeMode && handleDragStart(e, item.id)}
                        onDragOver={(e) => isRearrangeMode && handleDragOver(e, item.id)}
                        onDragLeave={isRearrangeMode ? handleDragLeave : undefined}
                        onDrop={(e) => isRearrangeMode && handleDrop(e, item.id)}
                        onDragEnd={isRearrangeMode ? handleDragEnd : undefined}
                        className={`rounded-lg border border-[#233457]/20 bg-white/50 relative transition-all ${
                          isRearrangeMode
                            ? draggedItemId === item.id
                              ? "opacity-50 cursor-grabbing p-3"
                              : dragOverItemId === item.id
                              ? "border-[#5ea0ff] border-2 bg-blue-50/50 scale-[1.02] p-3"
                              : "cursor-grab hover:border-[#233457]/40 p-3"
                            : "p-2.5 sm:p-4"
                        }`}
                        style={{
                          transform: isRearrangeMode && draggedItemId === item.id ? "rotate(2deg)" : undefined,
                        }}
                      >
                        {/* Drag Handle - Only show in rearrange mode */}
                        {isRearrangeMode && (
                          <div
                            className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 cursor-grab active:cursor-grabbing opacity-40 hover:opacity-70 transition-opacity"
                            style={{ touchAction: "none" }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#233457]">
                              <circle cx="9" cy="5" r="1.5" fill="currentColor"/>
                              <circle cx="15" cy="5" r="1.5" fill="currentColor"/>
                              <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
                              <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
                              <circle cx="9" cy="19" r="1.5" fill="currentColor"/>
                              <circle cx="15" cy="19" r="1.5" fill="currentColor"/>
                            </svg>
                          </div>
                        )}
                        {/* Item Number Badge */}
                        <div
                          className={`absolute flex items-center justify-center rounded-full text-[10px] font-extrabold text-[#233457] bg-amber-200/60 border border-amber-300/40 ${
                            isRearrangeMode ? "left-2 top-2 w-6 h-6" : "left-2 top-2 w-6 h-6"
                          }`}
                          style={{
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
                          }}
                        >
                          {index + 1}
                        </div>

                        {/* Delete Button - Only show when not in rearrange mode */}
                        {!isRearrangeMode && (
                          <button
                            type="button"
                            onClick={() => handleDeleteExperience(item.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-md text-white hover:bg-red-600 transition-colors z-10"
                            style={{
                              background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 55%, #b73838 100%)",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                            }}
                            title="Delete Experience"
                            aria-label="Delete Experience"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        )}

                        {/* Collapsed View (Rearrange Mode) */}
                        {isRearrangeMode ? (
                          <div className="pl-8 pr-2 flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs sm:text-sm font-semibold text-[#233457] truncate">{item.role || "Untitled"}</div>
                              <div className="text-[10px] sm:text-xs text-[#233457]/70 truncate">{item.org || "No organization"}</div>
                            </div>
                            <div className="shrink-0">
                              <PeriodPill start={item.start || ""} end={item.end} />
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Role Field */}
                            <div className="mb-3 sm:mb-4 pl-6">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Role
                              </label>
                              <input
                                type="text"
                                value={item.role}
                                onChange={(e) => handleExperienceChange(item.id, "role", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="e.g., Software Developer"
                              />
                            </div>

                            {/* Organization Field */}
                            <div className="mb-3 sm:mb-4 pl-6">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Organization
                              </label>
                              <input
                                type="text"
                                value={item.org}
                                onChange={(e) => handleExperienceChange(item.id, "org", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="e.g., Company Name"
                              />
                            </div>

                            {/* Start Date Field */}
                            <div className="mb-3 sm:mb-4 pl-6">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Start Date
                              </label>
                              <input
                                type="text"
                                value={item.start}
                                onChange={(e) => handleExperienceChange(item.id, "start", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="e.g., 2024 or Present"
                              />
                            </div>

                            {/* End Date Field */}
                            <div className="mb-3 sm:mb-4 pl-6">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                End Date (optional)
                              </label>
                              <input
                                type="text"
                                value={item.end || ""}
                                onChange={(e) => handleExperienceChange(item.id, "end", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="e.g., 2026 or Present (leave empty if ongoing)"
                              />
                            </div>

                            {/* Awards Section */}
                            <div className="pl-6">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                                <label className="block text-xs font-semibold text-[#233457]">
                                  Awards (optional)
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleAddAward(item.id)}
                                  className="inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-white active:translate-y-0.5 transition cr-glass-hover"
                                  style={{
                                    border: "1px solid color-mix(in oklab, #5ea0ff 35%, white 10%)",
                                    background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                                  }}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  <span>Add Award</span>
                                </button>
                              </div>
                              <div className="space-y-2">
                                {(item.awards || []).map((award, awardIndex) => (
                                  <div key={awardIndex} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={award}
                                      onChange={(e) => handleAwardChange(item.id, awardIndex, e.target.value)}
                                      className="flex-1 px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                      placeholder="Award description"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAward(item.id, awardIndex)}
                                      className="p-1.5 rounded-md text-white hover:bg-red-600 transition-colors shrink-0"
                                      style={{
                                        background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 55%, #b73838 100%)",
                                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                                      }}
                                      title="Delete Award"
                                      aria-label="Delete Award"
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                                {(!item.awards || item.awards.length === 0) && (
                                  <div className="text-[10px] sm:text-xs text-[#233457]/60 italic">
                                    No awards yet. Click &quot;Add Award&quot; to add one.
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {formData.items.length === 0 && (
                      <div className="text-center py-8 text-[#233457]/60 text-sm">
                        No experience items yet. Click &quot;Add Experience&quot; to add one.
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons - Always visible at bottom */}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[210] grid place-items-center p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="Delete Confirmation">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => {
            setShowDeleteModal(false);
            setDeleteType(null);
            setDeleteData(null);
          }} />
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
                Delete {deleteType === "experience" ? "Experience" : "Award"}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteType(null);
                  setDeleteData(null);
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
                <p className="text-sm text-[#233457] text-center font-semibold">
                  Are you sure you want to delete this {deleteType === "experience" ? "experience" : "award"}? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteType(null);
                    setDeleteData(null);
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
