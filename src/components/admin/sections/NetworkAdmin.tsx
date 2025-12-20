"use client";
import { useState, useEffect, useRef } from "react";
import Card from "@/components/ui/Card";
import { getNetworkData, saveNetworkData, type NetworkData, type SocialLink, type ContactTile } from "@/lib/network-data";
import { showToast, updateToast, removeToast } from "@/components/ui/Toast";

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

export default function NetworkAdmin() {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editScale, setEditScale] = useState(0.96);
  const editTimerRef = useRef<number | null>(null);
  const [editTab, setEditTab] = useState<"memberships" | "social" | "speaking" | "contact">("memberships");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalScale, setDeleteModalScale] = useState(0.96);
  const [deleteType, setDeleteType] = useState<"membership" | "social" | "contact" | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const deleteTimerRef = useRef<number | null>(null);
  const [membershipInput, setMembershipInput] = useState("");
  const [showFull, setShowFull] = useState(false);
  const [scale, setScale] = useState(0.96);
  const timerRef = useRef<number | null>(null);
  const [isRearrangeMode, setIsRearrangeMode] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);

  // Form state for editing
  const [formData, setFormData] = useState<NetworkData>({
    memberships: [],
    socialLinks: [],
    speaking: "",
    contactTiles: [],
  });

  // Load network data from Firebase on mount
  useEffect(() => {
    const loadNetworkData = async () => {
      try {
        setLoading(true);
        console.log("[NetworkAdmin] Loading data from Firebase...");
        const data = await getNetworkData();
        console.log("[NetworkAdmin] Data loaded:", {
          membershipsCount: data.memberships?.length || 0,
          socialLinksCount: data.socialLinks?.length || 0,
          hasSpeaking: !!data.speaking,
          contactTilesCount: data.contactTiles?.length || 0,
        });
        setNetworkData(data);
        setFormData(data);
      } catch (error) {
        console.error("[NetworkAdmin] Error loading network data:", error);
      } finally {
        setLoading(false);
        console.log("[NetworkAdmin] Loading complete");
      }
    };

    loadNetworkData();
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
      setFormData(networkData || {
        memberships: [],
        socialLinks: [],
        speaking: "",
        contactTiles: [],
      });
      setEditTab("memberships"); // Reset to first tab when opening modal
      setMembershipInput("");
      setIsRearrangeMode(false);
    }
  }, [showEditModal, networkData]);

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

  const handleSave = async () => {
    setShowEditModal(false);
    
    const toastId = showToast("Saving changes...", "loading", 0);

    try {
      updateToast(toastId, { message: "Saving to database...", progress: 95 });
      await saveNetworkData(formData);
      setNetworkData(formData);
      
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
    setFormData(networkData || {
      memberships: [],
      socialLinks: [],
      speaking: "",
      contactTiles: [],
    });
    setShowEditModal(false);
    setMembershipInput("");
    setIsRearrangeMode(false);
  };

  // Drag and Drop handlers for memberships
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedItemIndex !== null && draggedItemIndex !== index) {
      setDragOverItemIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverItemIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverItemIndex(null);

    if (draggedItemIndex === null || draggedItemIndex === targetIndex) {
      setDraggedItemIndex(null);
      return;
    }

    const memberships = [...formData.memberships];
    const [draggedItem] = memberships.splice(draggedItemIndex, 1);
    memberships.splice(targetIndex, 0, draggedItem);

    setFormData({ ...formData, memberships });
    setDraggedItemIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
  };

  // Memberships handlers
  const handleAddMembership = () => {
    if (!membershipInput.trim()) return;
    setFormData({
      ...formData,
      memberships: [membershipInput.trim(), ...formData.memberships],
    });
    setMembershipInput("");
  };

  const handleDeleteMembership = (index: number) => {
    setDeleteType("membership");
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  // Social Links handlers
  const handleAddSocialLink = () => {
    const newLink: SocialLink = {
      label: "",
      href: "",
      icon: "",
    };
    setFormData({
      ...formData,
      socialLinks: [newLink, ...formData.socialLinks],
    });
  };

  const handleDeleteSocialLink = (index: number) => {
    setDeleteType("social");
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...formData.socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, socialLinks: updated });
  };

  // Contact Tiles handlers
  const handleAddContactTile = () => {
    const newTile: ContactTile = {
      title: "",
      desc: "",
      href: "#contact",
    };
    setFormData({
      ...formData,
      contactTiles: [newTile, ...formData.contactTiles],
    });
  };

  const handleDeleteContactTile = (index: number) => {
    setDeleteType("contact");
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const handleContactTileChange = (index: number, field: keyof ContactTile, value: string) => {
    const updated = [...formData.contactTiles];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, contactTiles: updated });
  };

  const confirmDelete = () => {
    if (deleteType === null || deleteIndex === null) return;

    if (deleteType === "membership") {
      setFormData({
        ...formData,
        memberships: formData.memberships.filter((_, i) => i !== deleteIndex),
      });
    } else if (deleteType === "social") {
      setFormData({
        ...formData,
        socialLinks: formData.socialLinks.filter((_, i) => i !== deleteIndex),
      });
    } else if (deleteType === "contact") {
      setFormData({
        ...formData,
        contactTiles: formData.contactTiles.filter((_, i) => i !== deleteIndex),
      });
    }

    setShowDeleteModal(false);
    setDeleteType(null);
    setDeleteIndex(null);
  };

  if (loading || !networkData) {
    return (
      <div className="col-span-full relative">
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
      </div>
    );
  }

  return (
    <>
      <div className="col-span-full relative">
        {/* Edit Button */}
        <button
          onClick={() => setShowEditModal(true)}
          className="absolute -top-2 -right-2 z-30 p-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-lg transition-colors"
          title="Edit Network Section"
          aria-label="Edit Network Section"
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* Network Component UI */}
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
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[200] grid place-items-center p-1 sm:p-4" role="dialog" aria-modal="true" aria-label="Edit Network Section">
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
              }}>Edit Network</div>
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
            {/* Inner content container area (tabs + panel) */}
            <div className="px-2 sm:px-4 pb-3 sm:pb-6 pt-1 sm:pt-2 flex-1 flex flex-col min-h-0 overflow-y-auto" style={{
              background: "linear-gradient(360deg, #808a99 0%, #6b7586 100%)"
            }}>
              {/* Segmented tabs (rail + raised tabs) */}
              <div className="w-full flex-shrink-0">
                {/* Rail */}
                <div className="h-10 sm:h-12" style={{
                  background: "linear-gradient(180deg, #5a6576 0%, #475260 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                }} />
                {/* Tabs centered overlapping the rail */}
                <div className="-mt-[32px] sm:-mt-[38px] px-1 sm:px-2 flex items-end justify-center gap-1 sm:gap-2 w-full flex-wrap">
                  <button
                    type="button"
                    onClick={() => setEditTab("memberships")}
                    className="px-3 py-1.5 sm:px-6 sm:py-2 rounded-t-xl text-[10px] sm:text-sm font-extrabold min-w-[80px] sm:min-w-28"
                    style={editTab === "memberships" ? {
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
                  >Memberships</button>
                  <button
                    type="button"
                    onClick={() => setEditTab("social")}
                    className="px-3 py-1.5 sm:px-6 sm:py-2 rounded-t-xl text-[10px] sm:text-sm font-extrabold min-w-[80px] sm:min-w-28"
                    style={editTab === "social" ? {
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
                  >Social Links</button>
                  <button
                    type="button"
                    onClick={() => setEditTab("speaking")}
                    className="px-3 py-1.5 sm:px-6 sm:py-2 rounded-t-xl text-[10px] sm:text-sm font-extrabold min-w-[80px] sm:min-w-28"
                    style={editTab === "speaking" ? {
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
                  >Speaking</button>
                  <button
                    type="button"
                    onClick={() => setEditTab("contact")}
                    className="px-3 py-1.5 sm:px-6 sm:py-2 rounded-t-xl text-[10px] sm:text-sm font-extrabold min-w-[80px] sm:min-w-28"
                    style={editTab === "contact" ? {
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
                  >Contact Tiles</button>
                </div>
              </div>

              {/* Content panel wrapper */}
              <div className="mt-2 sm:mt-4 rounded-xl flex-1 min-h-0 overflow-y-auto flex flex-col" style={{
                background: "linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%)",
                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                padding: "8px",
              }}>
                <div className="space-y-3 sm:space-y-4 flex-1 min-h-0 overflow-y-auto">
                  {/* Memberships Tab */}
                  {editTab === "memberships" && (
                    <div>
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
                          <div className="flex gap-2 w-full sm:w-auto">
                            <input
                              type="text"
                              value={membershipInput}
                              onChange={(e) => setMembershipInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddMembership();
                                }
                              }}
                              className="flex-1 sm:w-64 px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                              placeholder="Enter membership name"
                            />
                            <button
                              type="button"
                              onClick={handleAddMembership}
                              className="inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 sm:px-3 py-2 text-[10px] sm:text-xs font-semibold text-white active:translate-y-0.5 transition cr-glass-hover"
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
                        )}
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        {formData.memberships.map((membership, index) => (
                          <div
                            key={index}
                            draggable={isRearrangeMode}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`rounded-lg p-2.5 sm:p-4 border border-[#233457]/20 bg-white/50 relative ${
                              isRearrangeMode ? "cursor-move" : ""
                            } ${
                              draggedItemIndex === index ? "opacity-50" : ""
                            } ${
                              dragOverItemIndex === index ? "border-[#5ea0ff] border-2" : ""
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
                                    <span className="text-[10px] sm:text-xs font-semibold">#{index + 1}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs sm:text-sm font-semibold text-[#233457] truncate">{membership || "Untitled Membership"}</div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                {/* Normal Mode - Full Edit Form */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMembership(index)}
                                  className="absolute top-2 right-2 p-1.5 rounded-md text-white hover:bg-red-600 transition-colors"
                                  style={{
                                    background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 55%, #b73838 100%)",
                                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                                  }}
                                  title="Delete Membership"
                                  aria-label="Delete Membership"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                                <input
                                  type="text"
                                  value={membership}
                                  onChange={(e) => {
                                    const updated = [...formData.memberships];
                                    updated[index] = e.target.value;
                                    setFormData({ ...formData, memberships: updated });
                                  }}
                                  className="w-full pr-10 px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                  placeholder="Membership name"
                                />
                              </>
                            )}
                          </div>
                        ))}
                        {(!formData.memberships || formData.memberships.length === 0) && (
                          <div className="text-center py-8 text-[#233457]/60 text-sm">
                            No memberships yet. Add one above.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Social Links Tab */}
                  {editTab === "social" && (
                    <div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                        <label className="block text-xs sm:text-sm font-semibold text-[#233457]">
                          Social Links
                        </label>
                        <button
                          type="button"
                          onClick={handleAddSocialLink}
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
                          <span>Add Social Link</span>
                        </button>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        {formData.socialLinks.map((link, index) => (
                          <div
                            key={index}
                            className="rounded-lg p-2.5 sm:p-4 border border-[#233457]/20 bg-white/50 relative"
                          >
                            <button
                              type="button"
                              onClick={() => handleDeleteSocialLink(index)}
                              className="absolute top-2 right-2 p-1.5 rounded-md text-white hover:bg-red-600 transition-colors"
                              style={{
                                background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 55%, #b73838 100%)",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                              }}
                              title="Delete Social Link"
                              aria-label="Delete Social Link"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <div className="mb-3 sm:mb-4">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Label
                              </label>
                              <input
                                type="text"
                                value={link.label}
                                onChange={(e) => handleSocialLinkChange(index, "label", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="e.g., LinkedIn, GitHub"
                              />
                            </div>
                            <div className="mb-3 sm:mb-4">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                URL
                              </label>
                              <input
                                type="url"
                                value={link.href}
                                onChange={(e) => handleSocialLinkChange(index, "href", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="https://..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Icon (Platform name)
                              </label>
                              <input
                                type="text"
                                value={link.icon || ""}
                                onChange={(e) => handleSocialLinkChange(index, "icon", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="e.g., linkedin, github, instagram"
                              />
                              <p className="text-[10px] sm:text-xs text-[#233457]/60 mt-1">Leave empty to auto-detect from label</p>
                            </div>
                          </div>
                        ))}
                        {(!formData.socialLinks || formData.socialLinks.length === 0) && (
                          <div className="text-center py-8 text-[#233457]/60 text-sm">
                            No social links yet. Click &quot;Add Social Link&quot; to add one.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Speaking Tab */}
                  {editTab === "speaking" && (
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-[#233457] mb-1.5">
                        Speaking Description
                      </label>
                      <textarea
                        value={formData.speaking}
                        onChange={(e) => setFormData({ ...formData, speaking: e.target.value })}
                        className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                        placeholder="Available for speaking at events about software development and emerging technologies."
                        rows={6}
                        style={{ resize: "vertical" }}
                      />
                    </div>
                  )}

                  {/* Contact Tiles Tab */}
                  {editTab === "contact" && (
                    <div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                        <label className="block text-xs sm:text-sm font-semibold text-[#233457]">
                          Contact Tiles
                        </label>
                        <button
                          type="button"
                          onClick={handleAddContactTile}
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
                          <span>Add Contact Tile</span>
                        </button>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        {formData.contactTiles.map((tile, index) => (
                          <div
                            key={index}
                            className="rounded-lg p-2.5 sm:p-4 border border-[#233457]/20 bg-white/50 relative"
                          >
                            <button
                              type="button"
                              onClick={() => handleDeleteContactTile(index)}
                              className="absolute top-2 right-2 p-1.5 rounded-md text-white hover:bg-red-600 transition-colors"
                              style={{
                                background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 55%, #b73838 100%)",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                              }}
                              title="Delete Contact Tile"
                              aria-label="Delete Contact Tile"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <div className="mb-3 sm:mb-4">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Title
                              </label>
                              <input
                                type="text"
                                value={tile.title}
                                onChange={(e) => handleContactTileChange(index, "title", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="e.g., Email, Let's Talk"
                              />
                            </div>
                            <div className="mb-3 sm:mb-4">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Description
                              </label>
                              <input
                                type="text"
                                value={tile.desc}
                                onChange={(e) => handleContactTileChange(index, "desc", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="e.g., sonnypsarcia@gmail.com"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Link (Optional)
                              </label>
                              <input
                                type="text"
                                value={tile.href || ""}
                                onChange={(e) => handleContactTileChange(index, "href", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="#contact or https://..."
                              />
                            </div>
                          </div>
                        ))}
                        {(!formData.contactTiles || formData.contactTiles.length === 0) && (
                          <div className="text-center py-8 text-[#233457]/60 text-sm">
                            No contact tiles yet. Click &quot;Add Contact Tile&quot; to add one.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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

      {/* View All Memberships Modal */}
      {showFull && (
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
                Delete {deleteType === "membership" ? "Membership" : deleteType === "social" ? "Social Link" : "Contact Tile"}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteType(null);
                  setDeleteIndex(null);
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
                  Are you sure you want to delete this {deleteType === "membership" ? "membership" : deleteType === "social" ? "social link" : "contact tile"}? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteType(null);
                    setDeleteIndex(null);
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
