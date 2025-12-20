"use client";
import { useState, useEffect, useRef } from "react";
import Card from "@/components/ui/Card";
import { storage, auth } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getCertificationsData, saveCertificationsData, type CertificationsData, type Certificate } from "@/lib/certifications-data";
import { showToast, updateToast, removeToast } from "@/components/ui/Toast";

// Preview component for certificate uploads
function CertificatePreview({ file }: { file: File }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Cleanup function
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!previewUrl) {
    return (
      <div className="relative w-full h-48 rounded-md overflow-hidden border border-[#233457]/20 bg-[#233457]/10 flex items-center justify-center">
        <div className="text-xs text-[#233457]/50">Loading preview...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 rounded-md overflow-hidden border border-[#233457]/20 mt-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={previewUrl} 
        alt="Certificate preview" 
        className="w-full h-full object-contain"
        onError={(e) => {
          console.error("Error loading preview image");
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}

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
          <div className="text-xs sm:text-sm font-semibold text-white/95 group-hover:text-white transition-colors">
            {title}
          </div>
          <div className="text-[10px] sm:text-xs text-white/70">{org}</div>
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
          <p className="text-xs text-[#233457]/80 leading-relaxed mt-2">
            {details}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CertificationsAdmin() {
  const [certificationsData, setCertificationsData] = useState<CertificationsData>({
    certificates: [],
  });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editScale, setEditScale] = useState(0.96);
  const editTimerRef = useRef<number | null>(null);
  const [showFull, setShowFull] = useState(false);
  const [scale, setScale] = useState(0.96);
  const timerRef = useRef<number | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [photoScale, setPhotoScale] = useState(0.96);
  const photoTimerRef = useRef<number | null>(null);
  const [expandedCert, setExpandedCert] = useState<string | null>(null);
  const [isRearrangeMode, setIsRearrangeMode] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalScale, setDeleteModalScale] = useState(0.96);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteTimerRef = useRef<number | null>(null);
  const [selectedCertificateFiles, setSelectedCertificateFiles] = useState<Record<string, File>>({});
  const [uploadingCertificates, setUploadingCertificates] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [focusedCertId, setFocusedCertId] = useState<string | null>(null);
  const focusedCertRef = useRef<HTMLDivElement | null>(null);

  // Form state for editing
  const [formData, setFormData] = useState<CertificationsData>(certificationsData);

  // Load certifications data from Firebase on mount
  useEffect(() => {
    const loadCertificationsData = async () => {
      try {
        setLoading(true);
        console.log("[CertificationsAdmin] Loading data from Firebase...");
        const data = await getCertificationsData();
        console.log("[CertificationsAdmin] Data loaded:", {
          certificatesCount: data.certificates?.length || 0,
        });
        setCertificationsData(data);
        setFormData(data);
      } catch (error) {
        console.error("[CertificationsAdmin] Error loading certifications data:", error);
      } finally {
        setLoading(false);
        console.log("[CertificationsAdmin] Loading complete");
      }
    };

    loadCertificationsData();
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

  // Photo modal scale animation
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
      setFormData(certificationsData);
      setIsRearrangeMode(false);
    }
  }, [showEditModal, certificationsData]);

  const handleCertClick = (cert: Certificate) => {
    setFocusedCertId(cert.id);
    setShowFull(true);
  };

  const handleSave = async () => {
    setShowEditModal(false);
    
    const toastId = showToast("Saving changes...", "loading", 0);

    try {
      const updatedData: CertificationsData = {
        ...formData,
        certificates: formData.certificates || [],
      };
      let totalFiles = 0;
      let completedFiles = 0;

      // Count certificate files to upload
      Object.keys(selectedCertificateFiles).forEach((certificateId) => {
        if (selectedCertificateFiles[certificateId]) totalFiles++;
      });

      // Upload certificate files
      for (const certificateId of Object.keys(selectedCertificateFiles)) {
        const file = selectedCertificateFiles[certificateId];
        if (!file) continue;

        setUploadingCertificates((prev) => ({ ...prev, [certificateId]: true }));
        try {
          const certificateUrl = await uploadCertificateWithProgress(
            file,
            certificateId,
            (progress) => {
              const overallProgress = totalFiles > 0 
                ? Math.round((completedFiles / totalFiles) * 100 + (progress / totalFiles))
                : progress;
              updateToast(toastId, { 
                message: `Uploading certificate ${completedFiles + 1}/${totalFiles}...`,
                progress: overallProgress 
              });
            }
          );

          // Update the certificate with the image URL
          const certificateIndex = updatedData.certificates.findIndex(c => c.id === certificateId);
          if (certificateIndex !== -1) {
            updatedData.certificates[certificateIndex] = {
              ...updatedData.certificates[certificateIndex],
              imageUrl: certificateUrl,
            };
          }

          completedFiles++;
        } catch (error) {
          console.error(`Error uploading certificate ${certificateId}:`, error);
          setUploadingCertificates((prev) => ({ ...prev, [certificateId]: false }));
          throw error;
        }
      }

      // Clear selected files after upload
      setSelectedCertificateFiles({});

      updateToast(toastId, { message: "Saving to database...", progress: 95 });
      await saveCertificationsData(updatedData);
      setCertificationsData(updatedData);
      
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
    setFormData(certificationsData);
    setShowEditModal(false);
    setIsRearrangeMode(false);
    setSelectedCertificateFiles({});
  };

  // Handle certificate file select
  const handleCertificateFileSelect = (certificateId: string, file: File | null) => {
    if (!file) {
      setSelectedCertificateFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[certificateId];
        return newFiles;
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file.", "error");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showToast("File size must be less than 10MB.", "error");
      return;
    }

    setSelectedCertificateFiles((prev) => ({ ...prev, [certificateId]: file }));
  };

  // Upload certificate with progress
  const uploadCertificateWithProgress = async (
    file: File,
    certificateId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    if (!storage) {
      throw new Error("Firebase Storage is not initialized");
    }

    if (!auth) {
      throw new Error("Firebase Auth is not initialized");
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be authenticated to upload files");
    }

    // Get fresh ID token to ensure authentication
    try {
      await user.getIdToken(true); // Force refresh
    } catch (error) {
      console.error("Failed to get ID token:", error);
      throw new Error("Failed to authenticate user");
    }

    const path = `certifications/${certificateId}-${Date.now()}.${file.name.split('.').pop()}`;

    return new Promise((resolve, reject) => {
      const storageRef = ref(storage!, path);
      
      // Upload with metadata to ensure proper authentication
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: user.uid,
          uploadedAt: new Date().toISOString(),
        },
      });

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress((prev) => ({ ...prev, [certificateId]: progress }));
          onProgress?.(progress);
        },
        (error) => {
          console.error(`Upload error for certificate ${certificateId}:`, error);
          setUploadingCertificates((prev) => ({ ...prev, [certificateId]: false }));
          setUploadProgress((prev) => ({ ...prev, [certificateId]: 0 }));
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadingCertificates((prev) => ({ ...prev, [certificateId]: false }));
            setUploadProgress((prev) => ({ ...prev, [certificateId]: 0 }));
            resolve(downloadURL);
          } catch (error) {
            console.error(`Error getting download URL for certificate ${certificateId}:`, error);
            setUploadingCertificates((prev) => ({ ...prev, [certificateId]: false }));
            setUploadProgress((prev) => ({ ...prev, [certificateId]: 0 }));
            reject(error);
          }
        }
      );
    });
  };

  const handleAddCertificate = () => {
    const newCertificate: Certificate = {
      id: `cert-${Date.now()}`,
      title: "",
      org: "",
      href: "#",
      details: "",
      imageUrl: "",
    };
    setFormData({
      ...formData,
      certificates: [newCertificate, ...formData.certificates],
    });
  };

  const handleDeleteCertificate = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;

    setFormData({
      ...formData,
      certificates: formData.certificates.filter((c) => c.id !== deleteId),
    });

    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleCertificateChange = (id: string, field: keyof Certificate, value: string) => {
    const updated = formData.certificates.map((cert) =>
      cert.id === id ? { ...cert, [field]: value } : cert
    );
    setFormData({ ...formData, certificates: updated });
  };

  const handleViewPhoto = (cert: Certificate) => {
    setSelectedCert(cert);
    setShowPhotoModal(true);
  };

  const handleToggleExpand = (certId: string) => {
    setExpandedCert(expandedCert === certId ? null : certId);
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

    const certificates = [...formData.certificates];
    const draggedIndex = certificates.findIndex((c) => c.id === draggedItemId);
    const targetIndex = certificates.findIndex((c) => c.id === targetItemId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItemId(null);
      return;
    }

    // Remove dragged item and insert at target position
    const [draggedItem] = certificates.splice(draggedIndex, 1);
    certificates.splice(targetIndex, 0, draggedItem);

    setFormData({ ...formData, certificates });
    setDraggedItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  // Show loading state if data not loaded
  if (loading || !certificationsData) {
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
                <path d="M12 2 9.5 8H3l5.5 4-2 6L12 14l5.5 4-2-6L21 8h-6.5L12 2Z" fill="currentColor"/>
              </svg>
              <span>Recent Certifications</span>
            </>
          }
          className="col-span-full lg:col-span-6"
        >
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
          title="Edit Certifications Section"
          aria-label="Edit Certifications Section"
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* Certifications Component UI */}
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
          <div className="space-y-3">
            {certificationsData.certificates.filter((_, index) => isCertRecent(index)).map((c) => (
              <CertItem 
                key={c.id} 
                cert={c}
                onClick={() => handleCertClick(c)}
              />
            ))}
          </div>
        </Card>
      </div>

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
              {selectedCert.imageUrl ? (
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[200] grid place-items-center p-1 sm:p-4" role="dialog" aria-modal="true" aria-label="Edit Certifications Section">
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
              }}>Edit Certifications</div>
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
                        onClick={handleAddCertificate}
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
                        <span>Add Certificate</span>
                      </button>
                    )}
                  </div>

                  {/* Certificates List */}
                  <div className="space-y-3 sm:space-y-4">
                    {formData.certificates.map((certificate, index) => (
                      <div
                        key={certificate.id}
                        ref={focusedCertId === certificate.id ? focusedCertRef : undefined}
                        draggable={isRearrangeMode}
                        onDragStart={(e) => handleDragStart(e, certificate.id)}
                        onDragOver={(e) => handleDragOver(e, certificate.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, certificate.id)}
                        onDragEnd={handleDragEnd}
                        className={`rounded-lg p-2.5 sm:p-4 border border-[#233457]/20 bg-white/50 relative ${
                          isRearrangeMode ? "cursor-move" : ""
                        } ${
                          draggedItemId === certificate.id ? "opacity-50" : ""
                        } ${
                          dragOverItemId === certificate.id ? "border-[#5ea0ff] border-2" : ""
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
                                <div className="font-semibold text-[#233457] truncate">{certificate.title || "Untitled Certificate"}</div>
                                <div className="text-xs text-[#233457]/60">{isCertRecent(index) ? "Recent" : "Archive"}</div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Normal Mode - Full Edit Form */}
                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteCertificate(certificate.id)}
                              className="absolute top-2 right-2 p-1.5 rounded-md text-white hover:bg-red-600 transition-colors"
                              style={{
                                background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 55%, #b73838 100%)",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                              }}
                              title="Delete Certificate"
                              aria-label="Delete Certificate"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>

                            {/* Title */}
                            <div className="mb-3 sm:mb-4 pr-8">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Title
                              </label>
                              <input
                                type="text"
                                value={certificate.title}
                                onChange={(e) => handleCertificateChange(certificate.id, "title", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="Certificate title"
                              />
                            </div>

                            {/* Organization */}
                            <div className="mb-3 sm:mb-4">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Organization
                              </label>
                              <input
                                type="text"
                                value={certificate.org}
                                onChange={(e) => handleCertificateChange(certificate.id, "org", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="Issuing organization"
                              />
                            </div>

                            {/* Href */}
                            <div className="mb-3 sm:mb-4">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Certificate URL
                              </label>
                              <input
                                type="url"
                                value={certificate.href}
                                onChange={(e) => handleCertificateChange(certificate.id, "href", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="https://..."
                              />
                            </div>

                            {/* Certificate Image Upload */}
                            <div className="mb-3 sm:mb-4">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Certificate Image
                              </label>
                              <div className="space-y-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleCertificateFileSelect(certificate.id, e.target.files?.[0] || null)}
                                  className="w-full px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent file:mr-2 sm:file:mr-4 file:py-1 file:px-2 sm:file:px-3 file:rounded-md file:border-0 file:text-[10px] sm:file:text-xs file:font-semibold file:bg-[#5ea0ff] file:text-white hover:file:bg-[#2f66d0] file:cursor-pointer"
                                  disabled={uploadingCertificates[certificate.id]}
                                />
                                {selectedCertificateFiles[certificate.id] && (
                                  <>
                                    <div className="text-xs text-[#233457]/70">
                                      Selected: {selectedCertificateFiles[certificate.id].name} ({(selectedCertificateFiles[certificate.id].size / 1024 / 1024).toFixed(2)} MB)
                                    </div>
                                    <CertificatePreview file={selectedCertificateFiles[certificate.id]} />
                                  </>
                                )}
                                {uploadingCertificates[certificate.id] && (
                                  <div className="w-full bg-[#233457]/10 rounded-md h-2 overflow-hidden">
                                    <div
                                      className="h-full bg-[#5ea0ff] transition-all duration-300"
                                      style={{ width: `${uploadProgress[certificate.id] || 0}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                              <p className="text-[10px] sm:text-xs text-[#233457]/60 mt-1">Upload an image file (max 10MB)</p>
                            </div>

                            {/* Details */}
                            <div className="mb-3 sm:mb-4">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Details
                              </label>
                              <textarea
                                value={certificate.details}
                                onChange={(e) => handleCertificateChange(certificate.id, "details", e.target.value)}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="Certificate details/description"
                                rows={4}
                                style={{ resize: "vertical" }}
                              />
                            </div>

                            {/* Recent Status Info */}
                            <div className="mt-3 pt-3 border-t border-[#233457]/10">
                              <div className="text-xs text-[#233457]/70">
                                {isCertRecent(index) ? (
                                  <span className="inline-flex items-center gap-1.5">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    This certificate will appear as &quot;Recent&quot; (first 2 certificates are automatically recent)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                                      <path d="M5 5h14M5 12h14M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    This certificate will appear in the archive (only the first 2 certificates are recent)
                                  </span>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {formData.certificates.length === 0 && (
                      <div className="text-center py-8 text-[#233457]/60 text-sm">
                        No certificates yet. Click &quot;Add Certificate&quot; to add one.
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-[#233457]/20 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={Object.values(uploadingCertificates).some(u => u)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-white active:translate-y-0.5 transition cr-glass-hover flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
            setDeleteId(null);
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
                Delete Certificate
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
                <p className="text-sm text-[#233457] text-center font-semibold">
                  Are you sure you want to delete this certificate? This action cannot be undone.
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
