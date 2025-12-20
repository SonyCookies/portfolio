"use client";
import { useState, useEffect, useRef } from "react";
import Card from "@/components/ui/Card";
import Image from "next/image";
import { getTechStackData, saveTechStackData, type TechStackData } from "@/lib/techstack-data";
import { showToast, updateToast, removeToast } from "@/components/ui/Toast";

function Chip({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold text-black cr-glass-hover"
      style={{
        border: "1px solid color-mix(in oklab, var(--accent) 55%, #8f6a12 45%)",
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--accent) 92%, white 6%), color-mix(in oklab, var(--accent) 70%, #b68b1a 30%))",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.35)",
      }}
    >
      {label}
    </span>
  );
}

export default function TechStackAdmin() {
  const [techStackData, setTechStackData] = useState<TechStackData>({
    categories: {},
    featured: [],
  });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editScale, setEditScale] = useState(0.96);
  const editTimerRef = useRef<number | null>(null);
  const [showFull, setShowFull] = useState(false);
  const [scale, setScale] = useState(0.96);
  const timerRef = useRef<number | null>(null);
  const [featuredInput, setFeaturedInput] = useState("");
  const [categoryInputs, setCategoryInputs] = useState<Record<string, string>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalScale, setDeleteModalScale] = useState(0.96);
  const [deleteType, setDeleteType] = useState<"category" | "item" | "featured" | null>(null);
  const [deleteData, setDeleteData] = useState<{ categoryName?: string; itemIndex?: number; featuredIndex?: number } | null>(null);
  const deleteTimerRef = useRef<number | null>(null);

  // Form state for editing
  const [formData, setFormData] = useState<TechStackData>(techStackData);

  // Load tech stack data from Firebase on mount
  useEffect(() => {
    const loadTechStackData = async () => {
      try {
        setLoading(true);
        console.log("[TechStackAdmin] Loading data from Firebase...");
        const data = await getTechStackData();
        console.log("[TechStackAdmin] Data loaded:", {
          categoriesCount: Object.keys(data.categories || {}).length,
          featuredCount: data.featured?.length || 0,
        });
        setTechStackData(data);
        setFormData(data);
      } catch (error) {
        console.error("[TechStackAdmin] Error loading tech stack data:", error);
      } finally {
        setLoading(false);
        console.log("[TechStackAdmin] Loading complete");
      }
    };

    loadTechStackData();
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

  useEffect(() => {
    if (showEditModal) {
      setFormData(techStackData);
      setFeaturedInput("");
      setCategoryInputs({});
    }
  }, [showEditModal, techStackData]);

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
      await saveTechStackData(formData);
      setTechStackData(formData);
      
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
    setFormData(techStackData);
    setShowEditModal(false);
  };

  const handleAddCategory = () => {
    const newCategoryName = prompt("Enter category name:");
    if (newCategoryName && newCategoryName.trim()) {
      setFormData({
        ...formData,
        categories: {
          ...formData.categories,
          [newCategoryName.trim()]: [],
        },
      });
    }
  };

  const handleDeleteCategory = (categoryName: string) => {
    setDeleteType("category");
    setDeleteData({ categoryName });
    setShowDeleteModal(true);
  };

  const handleAddFeatured = () => {
    if (!featuredInput.trim()) return;

    // Split by comma and trim each item
    const items = featuredInput
      .split(",")
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (items.length === 0) return;

    setFormData({
      ...formData,
      featured: [...formData.featured, ...items],
    });

    setFeaturedInput("");
  };

  const handleAddItem = (categoryName: string) => {
    const inputValue = categoryInputs[categoryName] || "";
    if (!inputValue.trim()) return;

    // Split by comma and trim each item
    const items = inputValue
      .split(",")
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (items.length === 0) return;

    setFormData({
      ...formData,
      categories: {
        ...formData.categories,
        [categoryName]: [...(formData.categories[categoryName] || []), ...items],
      },
    });

    setCategoryInputs({
      ...categoryInputs,
      [categoryName]: "",
    });
  };

  const handleDeleteItem = (categoryName: string, itemIndex: number) => {
    setDeleteType("item");
    setDeleteData({ categoryName, itemIndex });
    setShowDeleteModal(true);
  };


  const handleDeleteFeatured = (index: number) => {
    setDeleteType("featured");
    setDeleteData({ featuredIndex: index });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteType || !deleteData) return;

    if (deleteType === "category" && deleteData.categoryName) {
      const newCategories = { ...formData.categories };
      delete newCategories[deleteData.categoryName];
      setFormData({
        ...formData,
        categories: newCategories,
      });
    } else if (deleteType === "item" && deleteData.categoryName !== undefined && deleteData.itemIndex !== undefined) {
      const newItems = [...(formData.categories[deleteData.categoryName] || [])];
      newItems.splice(deleteData.itemIndex, 1);
      setFormData({
        ...formData,
        categories: {
          ...formData.categories,
          [deleteData.categoryName]: newItems,
        },
      });
    } else if (deleteType === "featured" && deleteData.featuredIndex !== undefined) {
      setFormData({
        ...formData,
        featured: formData.featured.filter((_, i) => i !== deleteData.featuredIndex),
      });
    }

    setShowDeleteModal(false);
    setDeleteType(null);
    setDeleteData(null);
  };

  // Show loading state if data not loaded
  if (loading || !techStackData) {
    return (
      <div className="col-span-full lg:col-span-7 xl:col-span-8 mt-2 relative">
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
                <path d="M12 2 3 7l9 5 9-5-9-5Zm0 13-9-5v7l9 5 9-5v-7l-9 5Z" fill="currentColor"/>
              </svg>
              <span>Tech Stack</span>
            </>
          }
          className="col-span-full lg:col-span-7 xl:col-span-8 mt-2"
        >
          <div className="space-y-3">
            <div
              className="rounded-xl p-3 relative overflow-hidden animate-pulse"
              style={{
                background:
                  "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
                minHeight: 80,
              }}
            >
              <div className="h-3 w-20 bg-white/10 rounded mb-2" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-6 w-16 bg-white/10 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="col-span-full lg:col-span-7 xl:col-span-8 mt-2 relative">
        {/* Edit Button */}
        <button
          onClick={() => setShowEditModal(true)}
          className="absolute -top-2 -right-2 z-30 p-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-lg transition-colors"
          title="Edit Tech Stack Section"
          aria-label="Edit Tech Stack Section"
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* TechStack Component UI */}
        <Card
          title={
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2 3 7l9 5 9-5-9-5Zm0 13-9-5v7l9 5 9-5v-7l-9 5Z" fill="currentColor"/>
              </svg>
              <span>Tech Stack</span>
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
              title="View full"
            >
              <span>View full</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          }
          className="col-span-full lg:col-span-7 xl:col-span-8 mt-2"
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
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wide text-white/70 mb-2">Featured</div>
              <div className="flex flex-wrap gap-2">
                {techStackData.featured.map((c) => (
                  <Chip key={c} label={c} />
                ))}
              </div>
              <div aria-hidden className="pointer-events-none absolute left-2 right-2 top-1 h-1 rounded-full" style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.03))",
              }} />
            </div>
          </div>
        </Card>
      </div>

      {/* Full tech modal */}
      {showFull && (
        <div className="fixed inset-0 z-[110] grid place-items-center" role="dialog" aria-modal="true" aria-label="Full Tech Stack">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFull(false)} />
          <div className="relative z-[111]">
            {/* PorcoFG image - bottom-left corner extending outside */}
            <div 
              className="absolute -bottom-3 -left-40 z-10 pointer-events-none hidden lg:block" 
              style={{ 
                width: 250, 
                height: 250,
                transform: `scale(${scale})`,
                transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
              }}
            >
              <Image
                src="/PorcoFG.png"
                alt="Porco"
                width={250}
                height={250}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>
            <div className="w-[min(96vw,820px)] rounded-[30px] overflow-hidden" style={{
            background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
            transform: `scale(${scale})`,
            transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
          }}>
            <div className="relative flex items-center px-6 py-6" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            }}>
              <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide" style={{
                textTransform: "uppercase",
                textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45), -1px -1px 0 #1c2744, 1px -1px 0 #1c2744, -1px 1px 0 #1c2744, 1px 1px 0 #1c2744",
                letterSpacing: 1,
              }}>Full Tech Stack</div>
              <button
                type="button"
                onClick={() => setShowFull(false)}
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
            <div className="px-5 pb-6 pt-4 space-y-3">
              {Object.entries(techStackData.categories).map(([group, items]) => (
                <div key={group}
                  className="rounded-xl p-3 relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(180deg, #f5f9ff 0%, #e3ecfb 40%, #cfdbf1 100%)",
                    border: "1px solid rgba(0,0,0,0.12)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                  }}
                >
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wide text-[#233457]/85 mb-2">{group}</div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((c) => (
                      <span key={c} className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold text-black" style={{
                        border: "1px solid color-mix(in oklab, var(--accent) 55%, #8f6a12 45%)",
                        background: "linear-gradient(180deg, color-mix(in oklab, var(--accent) 92%, white 6%), color-mix(in oklab, var(--accent) 70%, #b68b1a 30%))",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.35)",
                      }}>{c}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[200] grid place-items-center p-1 sm:p-4" role="dialog" aria-modal="true" aria-label="Edit Tech Stack Section">
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
              }}>Edit Tech Stack</div>
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
                  {/* Featured Section */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#233457] mb-3">
                      Featured Technologies
                    </label>
                    {/* Add Featured Input */}
                    <div className="mb-3 flex gap-2">
                      <input
                        type="text"
                        value={featuredInput}
                        onChange={(e) => setFeaturedInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAddFeatured();
                          }
                        }}
                        className="flex-1 px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                        placeholder="Enter technology name(s), separated by commas (e.g., React, Vue.js, Angular)"
                      />
                      <button
                        type="button"
                        onClick={handleAddFeatured}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-semibold text-white active:translate-y-0.5 transition cr-glass-hover"
                        style={{
                          border: "1px solid color-mix(in oklab, #10b981 35%, white 10%)",
                          background: "linear-gradient(180deg, #10b981 0%, #059669 60%, #047857 100%)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="hidden sm:inline">Add</span>
                      </button>
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#233457]/60 mb-3">
                      Enter multiple technologies separated by commas. Press Enter or click Add.
                    </p>
                    {/* Featured List */}
                    <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-[#233457]/20 bg-white/50">
                      {formData.featured.length === 0 ? (
                        <div className="text-[10px] sm:text-xs text-[#233457]/60 w-full text-center py-2">No featured technologies yet.</div>
                      ) : (
                        formData.featured.map((item, index) => (
                          <div key={index} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold text-black" style={{
                            border: "1px solid color-mix(in oklab, var(--accent) 55%, #8f6a12 45%)",
                            background: "linear-gradient(180deg, color-mix(in oklab, var(--accent) 92%, white 6%), color-mix(in oklab, var(--accent) 70%, #b68b1a 30%))",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.35)",
                          }}>
                            {item}
                            <button
                              type="button"
                              onClick={() => handleDeleteFeatured(index)}
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

                  {/* Categories Section */}
                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                      <label className="block text-xs sm:text-sm font-semibold text-[#233457]">
                        Categories
                      </label>
                      <button
                        type="button"
                        onClick={handleAddCategory}
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
                        <span>Add Category</span>
                      </button>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      {Object.entries(formData.categories).map(([categoryName, items]) => (
                        <div
                          key={categoryName}
                          className="rounded-lg p-2.5 sm:p-4 border border-[#233457]/20 bg-white/50 relative"
                        >
                          {/* Delete Category Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(categoryName)}
                            className="absolute top-2 right-2 p-1.5 rounded-md text-white hover:bg-red-600 transition-colors"
                            style={{
                              background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 55%, #b73838 100%)",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                            }}
                            title="Delete Category"
                            aria-label="Delete Category"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>

                          {/* Category Name */}
                          <div className="mb-3 sm:mb-4 pr-8">
                            <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                              Category Name
                            </label>
                            <input
                              type="text"
                              value={categoryName}
                              onChange={(e) => {
                                const newCategories = { ...formData.categories };
                                const oldItems = newCategories[categoryName] || [];
                                delete newCategories[categoryName];
                                newCategories[e.target.value] = oldItems;
                                setFormData({
                                  ...formData,
                                  categories: newCategories,
                                });
                              }}
                              className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                              placeholder="Category name"
                            />
                          </div>

                          {/* Add Item Input */}
                          <div className="mb-3 sm:mb-4 flex gap-2">
                            <input
                              type="text"
                              value={categoryInputs[categoryName] || ""}
                              onChange={(e) => setCategoryInputs({
                                ...categoryInputs,
                                [categoryName]: e.target.value,
                              })}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddItem(categoryName);
                                }
                              }}
                              className="flex-1 px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                              placeholder="Enter technology name(s), separated by commas"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddItem(categoryName)}
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
                          <p className="text-[10px] sm:text-xs text-[#233457]/60 mb-3">
                            Enter multiple technologies separated by commas. Press Enter or click Add.
                          </p>

                          {/* Items List */}
                          <div className="flex flex-wrap gap-2">
                            {items.length === 0 ? (
                              <div className="text-xs text-[#233457]/60 w-full text-center py-2">No technologies in this category yet.</div>
                            ) : (
                              items.map((item, itemIndex) => (
                                <div key={itemIndex} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold text-black" style={{
                                  border: "1px solid color-mix(in oklab, var(--accent) 55%, #8f6a12 45%)",
                                  background: "linear-gradient(180deg, color-mix(in oklab, var(--accent) 92%, white 6%), color-mix(in oklab, var(--accent) 70%, #b68b1a 30%))",
                                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.35)",
                                }}>
                                  {item}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(categoryName, itemIndex)}
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
                      ))}
                      {Object.keys(formData.categories).length === 0 && (
                        <div className="text-center py-8 text-[#233457]/60 text-sm">
                          No categories yet. Click &quot;Add Category&quot; to add one.
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
                Delete {deleteType === "category" ? "Category" : deleteType === "item" ? "Technology" : "Featured Technology"}
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
                  Are you sure you want to delete this {deleteType === "category" ? "category" : deleteType === "item" ? "technology" : "featured technology"}? This action cannot be undone.
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

