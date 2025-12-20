"use client";
import { useState, useEffect, useRef } from "react";
import { getContactData, saveContactData, type ContactData, type SocialLink } from "@/lib/contact-data";
import { showToast, updateToast, removeToast } from "@/components/ui/Toast";

export default function ContactAdmin() {
  const [contactData, setContactData] = useState<ContactData>({
    email: "sonnypsarcia@gmail.com",
    phone: "+639266301717",
    socialLinks: [],
  });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editScale, setEditScale] = useState(0.96);
  const editTimerRef = useRef<number | null>(null);
  const [editTab, setEditTab] = useState<"contact" | "social">("contact");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalScale, setDeleteModalScale] = useState(0.96);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const deleteTimerRef = useRef<number | null>(null);

  // Form state for editing
  const [formData, setFormData] = useState<ContactData>(contactData);

  // Load contact data from Firebase on mount
  useEffect(() => {
    const loadContactData = async () => {
      try {
        setLoading(true);
        console.log("[ContactAdmin] Loading data from Firebase...");
        const data = await getContactData();
        console.log("[ContactAdmin] Data loaded:", {
          hasEmail: !!data.email,
          hasPhone: !!data.phone,
          socialLinksCount: data.socialLinks?.length || 0,
        });
        setContactData(data);
        setFormData(data);
      } catch (error) {
        console.error("[ContactAdmin] Error loading contact data:", error);
      } finally {
        setLoading(false);
        console.log("[ContactAdmin] Loading complete");
      }
    };

    loadContactData();
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
      setFormData(contactData);
      setEditTab("contact"); // Reset to first tab when opening modal
    }
  }, [showEditModal, contactData]);

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
      await saveContactData(formData);
      setContactData(formData);
      
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
    setFormData(contactData);
    setShowEditModal(false);
  };

  const handleAddSocialLink = () => {
    const newLink: SocialLink = {
      platform: "",
      url: "",
      label: "",
    };
    setFormData({
      ...formData,
      socialLinks: [newLink, ...formData.socialLinks],
    });
  };

  const handleDeleteSocialLink = (index: number) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteIndex === null) return;

    setFormData({
      ...formData,
      socialLinks: formData.socialLinks.filter((_, i) => i !== deleteIndex),
    });

    setShowDeleteModal(false);
    setDeleteIndex(null);
  };

  const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...formData.socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, socialLinks: updated });
  };

  // Format phone number for display
  const formatPhone = (phone: string) => {
    // Format: +63-9266-301-717
    if (phone.startsWith("+63")) {
      const cleaned = phone.replace(/\D/g, "");
      if (cleaned.length === 12) {
        return `+${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
      }
    }
    return phone;
  };

  // Get social link icon SVG
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "linkedin":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path fill="white" d="M6.94 8.5H4.25V20h2.69V8.5ZM5.6 7.22A1.6 1.6 0 1 0 5.6 4a1.6 1.6 0 0 0 0 3.22Zm5.87 5.05c0-.76.62-1.37 1.38-1.37.9 0 1.37.61 1.37 1.73V20h2.68v-6.43c0-2.57-1.37-3.77-3.2-3.77-1.48 0-2.15.81-2.52 1.37v-1.2h-2.6V20h2.6v-7.73Z"/>
          </svg>
        );
      case "github":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path fill="white" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48 0-.23 0-.84 0-1.64-2.78.61-3.37-1.34-3.37-1.34-.46-1.17-1.12-1.48-1.12-1.48-.91-.62.07-.6.07-.6 1 .07 1.52 1.03 1.52 1.03.9 1.52 2.37 1.08 2.94.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.26.1-2.63 0 0 .85-.27 2.77 1.02A9.6 9.6 0 0 1 12 6.8a9.6 9.6 0 0 1 2.52.34c1.92-1.29 2.77-1.02 2.77-1.02.55 1.37.2 2.38.1 2.63.64.7 1.02 1.58 1.02 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.67.92.67 1.86 0 1.35 0 2.44 0 2.77 0 .26.18.57.69.48A10 10 0 0 0 12 2Z"/>
          </svg>
        );
      case "facebook":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path fill="white" d="M13.5 20v-6h2.02l.31-2.33H13.5V9.62c0-.67.19-1.13 1.15-1.13h1.24V6.37c-.22-.03-.98-.09-1.86-.09-1.84 0-3.1 1.12-3.1 3.17v1.77H8.9V14h1.93v6h2.67Z"/>
          </svg>
        );
      case "instagram":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path fill="white" d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5.2A4.8 4.8 0 1 0 16.8 13 4.81 4.81 0 0 0 12 8.2Zm0 7.6A2.8 2.8 0 1 1 14.8 13 2.8 2.8 0 0 1 12 15.8Zm5.85-9.9a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3Z"/>
          </svg>
        );
      default:
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path fill="white" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
    }
  };

  // Show loading state if data not loaded
  if (loading || !contactData) {
    return (
      <div className="mt-4 relative">
        {/* Edit Button Skeleton */}
        <div
          className="absolute -top-2 -right-2 z-30 p-2 rounded-lg bg-yellow-400/50 animate-pulse"
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div className="w-5 h-5 bg-gray-900/20 rounded" />
        </div>
        <div className="relative block rounded-2xl animate-pulse" style={{
          padding: 0,
          filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.45))",
        }}>
          <div className="rounded-2xl relative overflow-hidden bg-white/10" style={{
            border: "1px solid rgba(255,255,255,0.18)",
            padding: 10,
            minHeight: 120,
          }} />
        </div>
        <div className="mt-3">
          <div className="text-white/80 text-xs sm:text-sm mb-2">Social Links</div>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-12 h-12 rounded-lg bg-white/10 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 relative">
        {/* Edit Button */}
        <button
          onClick={() => setShowEditModal(true)}
          className="absolute -top-2 -right-2 z-30 p-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-lg transition-colors"
          title="Edit Contact Section"
          aria-label="Edit Contact Section"
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* Contact Component UI */}
        <div className="mt-4">
          <div
            className="relative block rounded-2xl active:translate-y-0.5 transition"
            style={{
              padding: 0,
              filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.45))",
            }}
          >
            {/* Yellow slab background */}
            <div
              className="rounded-2xl relative overflow-hidden"
              style={{
                border: "1px solid color-mix(in oklab, var(--accent) 55%, #8f6a12 45%)",
                background:
                  "linear-gradient(180deg, color-mix(in oklab, var(--accent) 92%, white 6%), color-mix(in oklab, var(--accent) 70%, #b68b1a 30%))",
                boxShadow:
                  "inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 0 rgba(0,0,0,0.45), inset 0 0 0 1px rgba(0,0,0,0.06)",
                padding: 10,
              }}
            >
              {/* subtle specular highlight strip */}
              <div
                className="pointer-events-none absolute left-2 right-2 top-1 rounded-full"
                style={{
                  height: 6,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.05))",
                  filter: "blur(0.2px)",
                }}
              />
              {/* Header */}
              <div className="px-2 py-1 rounded-lg text-black font-extrabold"
                style={{
                  background: "linear-gradient(180deg, rgba(255,223,128,0.5), rgba(255,198,64,0.35))",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
                }}
              >
                Contact
              </div>
              {/* Details */}
              <div className="mt-2 grid gap-3">
                {contactData.email && (
                  <div>
                    <a
                      href={`mailto:${contactData.email}`}
                      className="group mt-1 inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-black font-extrabold hover:brightness-[1.06]"
                      style={{
                        border: "1px solid rgba(0,0,0,0.2)",
                        background: "linear-gradient(180deg, #ffd74f, #e7b21a)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -2px 0 rgba(0,0,0,0.3), 0 6px 10px -10px rgba(0,0,0,0.6)",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Zm2.2-.25 6.34 4.53c.29.21.68.21.97 0L18.86 6.5H5.2Z" fill="#0b1530"/>
                      </svg>
                      <span>{contactData.email}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="ml-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <path d="M9 5h10v10h-2V9.41l-9.3 9.3-1.4-1.42 9.3-9.3H9V5Z" fill="#0b1530"/>
                      </svg>
                    </a>
                  </div>
                )}
                {contactData.phone && (
                  <div>
                    <a
                      href={`tel:${contactData.phone}`}
                      className="group mt-1 inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-black font-extrabold hover:brightness-[1.06]"
                      style={{
                        border: "1px solid rgba(0,0,0,0.2)",
                        background: "linear-gradient(180deg, #ffd74f, #e7b21a)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -2px 0 rgba(0,0,0,0.3), 0 6px 10px -10px rgba(0,0,0,0.6)",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l1.98-1.98a1 1 0 0 1 1.03-.24c1.12.37 2.33.57 3.58.57.55 0 1 .45 1 1V20a1 1 0 0 1-1 1C10.85 21 3 13.15 3 3a1 1 0 0 1 1-1h2.27c.55 0 1 .45 1 1 0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.03l-1.98 1.98Z" fill="#0b1530"/>
                      </svg>
                      <span>{formatPhone(contactData.phone)}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="ml-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <path d="M9 5h10v10h-2V9.41l-9.3 9.3-1.4-1.42 9.3-9.3H9V5Z" fill="#0b1530"/>
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Social links */}
          {contactData.socialLinks && contactData.socialLinks.length > 0 && (
            <div className="mt-3">
              <div className="text-white/80 text-xs sm:text-sm mb-2">Social Links</div>
              <div className="flex items-center gap-3">
                {contactData.socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="inline-flex items-center justify-center rounded-lg active:translate-y-0.5 transition cr-glass-hover"
                    style={{
                      width: 48,
                      height: 48,
                      border: "1px solid rgba(255,255,255,0.18)",
                      background: "linear-gradient(180deg, #18223f 0%, #0f1a34 60%, #0b142b 100%)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 8px 16px -12px rgba(0,0,0,0.6)",
                    }}
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[200] grid place-items-center p-1 sm:p-4" role="dialog" aria-modal="true" aria-label="Edit Contact Section">
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
              }}>Edit Contact</div>
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
                <div className="-mt-[32px] sm:-mt-[38px] px-1 sm:px-2 flex items-end justify-center gap-1 sm:gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => setEditTab("contact")}
                    className="px-3 py-1.5 sm:px-6 sm:py-2 rounded-t-xl text-[10px] sm:text-sm font-extrabold min-w-[70px] sm:min-w-28"
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
                  >Contact</button>
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
                  {/* Contact Tab - Email and Phone */}
                  {editTab === "contact" && (
                    <>
                      {/* Email Field */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-[#233457] mb-1.5">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                          placeholder="Enter your email"
                        />
                      </div>

                      {/* Phone Field */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-[#233457] mb-1.5">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                          placeholder="Enter your phone number (e.g., +639266301717)"
                        />
                        <p className="text-[10px] sm:text-xs text-[#233457]/60 mt-1">Include country code (e.g., +63 for Philippines)</p>
                      </div>
                    </>
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
                            {/* Delete Button */}
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

                            {/* Platform Field */}
                            <div className="mb-3 sm:mb-4">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Platform
                              </label>
                              <input
                                type="text"
                                value={link.platform}
                                onChange={(e) => handleSocialLinkChange(index, "platform", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="e.g., LinkedIn, GitHub, Facebook"
                              />
                            </div>

                            {/* URL Field */}
                            <div className="mb-3 sm:mb-4">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                URL
                              </label>
                              <input
                                type="url"
                                value={link.url}
                                onChange={(e) => handleSocialLinkChange(index, "url", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="https://..."
                              />
                            </div>

                            {/* Label Field */}
                            <div>
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Label (for accessibility)
                              </label>
                              <input
                                type="text"
                                value={link.label}
                                onChange={(e) => handleSocialLinkChange(index, "label", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="e.g., LinkedIn, GitHub"
                              />
                            </div>
                          </div>
                        ))}
                        {formData.socialLinks.length === 0 && (
                          <div className="text-center py-8 text-[#233457]/60 text-xs sm:text-sm">
                            No social links yet. Click &quot;Add Social Link&quot; to add one.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
            setDeleteIndex(null);
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
                Delete Social Link
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
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
                  Are you sure you want to delete this social link? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
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
