"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { storage, auth } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getQuickNavData, saveQuickNavData, type QuickNavData, type Achievement, type Photo } from "@/lib/quicknav-data";
import { showToast, updateToast, removeToast } from "@/components/ui/Toast";

// Helper function to split autobiography into paragraphs
function splitIntoParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
}

// Preview component for photo uploads
function PhotoPreview({ file }: { file: File }) {
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
        alt="Photo preview" 
        className="w-full h-full object-contain"
        onError={(e) => {
          console.error("Error loading preview image");
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}

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

export default function QuickNavAdmin() {
  const [showAbout, setShowAbout] = useState(false);
  const [aboutTab, setAboutTab] = useState<"about" | "links">("about");
  const [aboutScale, setAboutScale] = useState(0.96);
  const [showTrophyModal, setShowTrophyModal] = useState(false);
  const [trophyScale, setTrophyScale] = useState(0.96);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoScale, setPhotoScale] = useState(0.96);
  const [showPhotoPreviewModal, setShowPhotoPreviewModal] = useState(false);
  const [photoPreviewScale, setPhotoPreviewScale] = useState(0.96);
  const [selectedPhoto, setSelectedPhoto] = useState<{ id: string; title: string; imageUrl: string; caption: string } | null>(null);
  const [selectedCertificateAchievement, setSelectedCertificateAchievement] = useState<Achievement | null>(null);
  const photoPreviewTimerRef = useRef<number | null>(null);
  const [expandedAchievement, setExpandedAchievement] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editScale, setEditScale] = useState(0.96);
  const [editTab, setEditTab] = useState<"about" | "photos" | "achievements">("about");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalScale, setDeleteModalScale] = useState(0.96);
  const [deleteType, setDeleteType] = useState<"photo" | "achievement" | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const aboutTimerRef = useRef<number | null>(null);
  const photoTimerRef = useRef<number | null>(null);
  const editTimerRef = useRef<number | null>(null);
  const deleteTimerRef = useRef<number | null>(null);

  // QuickNav data state
  const [quickNavData, setQuickNavData] = useState<QuickNavData>({
    autobiography: "",
    achievements: [],
    photos: [],
    contactEmail: "sonnypsarcia@gmail.com",
  });
  const [loading, setLoading] = useState(true);

  // Form state for editing
  const [formData, setFormData] = useState<QuickNavData>({
    autobiography: "",
    achievements: [],
    photos: [],
    contactEmail: "sonnypsarcia@gmail.com",
  });

  // File upload states for certificates
  const [selectedCertificateFiles, setSelectedCertificateFiles] = useState<Record<string, File>>({});
  const [uploadingCertificates, setUploadingCertificates] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // File upload states for photos
  const [selectedPhotoFiles, setSelectedPhotoFiles] = useState<Record<string, File>>({});
  const [uploadingPhotos, setUploadingPhotos] = useState<Record<string, boolean>>({});
  const [photoUploadProgress, setPhotoUploadProgress] = useState<Record<string, number>>({});

  // Handle photo file select
  const handlePhotoSelect = (photoId: string, file: File | null) => {
    if (!file) {
      setSelectedPhotoFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[photoId];
        return newFiles;
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("File size must be less than 10MB.");
      return;
    }

    setSelectedPhotoFiles((prev) => ({ ...prev, [photoId]: file }));
  };

  // Upload photo with progress
  const uploadPhotoWithProgress = async (
    file: File,
    photoId: string,
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

    const path = `quicknav/photos/${photoId}-${Date.now()}.${file.name.split('.').pop()}`;

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
          setPhotoUploadProgress((prev) => ({ ...prev, [photoId]: progress }));
          onProgress?.(progress);
        },
        (error) => {
          console.error(`Upload error for photo ${photoId}:`, error);
          setUploadingPhotos((prev) => ({ ...prev, [photoId]: false }));
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadingPhotos((prev) => ({ ...prev, [photoId]: false }));
            setPhotoUploadProgress((prev) => ({ ...prev, [photoId]: 0 }));
            resolve(downloadURL);
          } catch (error) {
            console.error(`Error getting download URL for photo ${photoId}:`, error);
            setUploadingPhotos((prev) => ({ ...prev, [photoId]: false }));
            reject(error);
          }
        }
      );
    });
  };

  const handleAddPhoto = () => {
    const newPhoto: Photo = {
      id: `photo-${Date.now()}`,
      title: "",
      imageUrl: "",
      caption: "",
    };
    setFormData({
      ...formData,
      photos: [newPhoto, ...formData.photos],
    });
  };

  const handleDeletePhoto = (photoId: string) => {
    setDeleteType("photo");
    setDeleteId(photoId);
    setShowDeleteModal(true);
  };

  const handleDeleteAchievement = (achievementId: string) => {
    setDeleteType("achievement");
    setDeleteId(achievementId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteType || !deleteId) return;

    if (deleteType === "photo") {
      setFormData({
        ...formData,
        photos: formData.photos.filter(p => p.id !== deleteId),
      });
      // Also remove any selected photo file for this photo
      setSelectedPhotoFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[deleteId];
        return newFiles;
      });
    } else if (deleteType === "achievement") {
      setFormData({
        ...formData,
        achievements: formData.achievements.filter(a => a.id !== deleteId),
      });
      // Also remove any selected certificate file for this achievement
      setSelectedCertificateFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[deleteId];
        return newFiles;
      });
    }

    setShowDeleteModal(false);
    setDeleteType(null);
    setDeleteId(null);
  };

  // Load QuickNav data from Firebase on mount
  useEffect(() => {
    const loadQuickNavData = async () => {
      try {
        setLoading(true);
        const data = await getQuickNavData();
        // Ensure all arrays are defined (in case of old data structure)
        const normalizedData: QuickNavData = {
          ...data,
          achievements: data.achievements || [],
          photos: (data.photos || []).map((photo: Photo) => ({
            ...photo,
            title: photo.title || "", // Ensure title field exists for backward compatibility
          })),
        };
        setQuickNavData(normalizedData);
        setFormData(normalizedData);
      } catch (error) {
        console.error("Error loading QuickNav data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQuickNavData();
  }, []);

  // Modal scale animations (same as QuickNav)
  useEffect(() => {
    if (!showAbout) return;
    setAboutScale(0.96);
    const raf = requestAnimationFrame(() => {
      setAboutScale(1.06);
      aboutTimerRef.current = window.setTimeout(() => {
        setAboutScale(1.0);
        aboutTimerRef.current = null;
      }, 120);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (aboutTimerRef.current) {
        clearTimeout(aboutTimerRef.current);
        aboutTimerRef.current = null;
      }
    };
  }, [showAbout]);


  useEffect(() => {
    if (!showTrophyModal) return;
    setTrophyScale(0.96);
    const raf = requestAnimationFrame(() => {
      setTrophyScale(1.06);
      const id = window.setTimeout(() => {
        setTrophyScale(1.0);
      }, 120);
      return () => clearTimeout(id);
    });
    return () => cancelAnimationFrame(raf);
  }, [showTrophyModal]);

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

  useEffect(() => {
    if (!showPhotoPreviewModal) return;
    setPhotoPreviewScale(0.96);
    const raf = requestAnimationFrame(() => {
      setPhotoPreviewScale(1.06);
      photoPreviewTimerRef.current = window.setTimeout(() => {
        setPhotoPreviewScale(1.0);
        photoPreviewTimerRef.current = null;
      }, 120);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (photoPreviewTimerRef.current) {
        clearTimeout(photoPreviewTimerRef.current);
        photoPreviewTimerRef.current = null;
      }
    };
  }, [showPhotoPreviewModal]);

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

  // Delete confirmation modal scale animation
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
      // Ensure all arrays are defined when setting form data
      setFormData({
        ...quickNavData,
        achievements: quickNavData.achievements || [],
        photos: quickNavData.photos || [],
      });
      setEditTab("about"); // Reset to first tab when opening modal
    }
  }, [showEditModal, quickNavData]);


  // Handle certificate file select
  const handleCertificateSelect = (achievementId: string, file: File | null) => {
    if (!file) {
      setSelectedCertificateFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[achievementId];
        return newFiles;
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("File size must be less than 10MB.");
      return;
    }

    setSelectedCertificateFiles((prev) => ({ ...prev, [achievementId]: file }));
  };

  // Upload certificate with progress
  const uploadCertificateWithProgress = async (
    file: File,
    achievementId: string,
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

    const path = `quicknav/certificates/${achievementId}-${Date.now()}.${file.name.split('.').pop()}`;

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
          setUploadProgress((prev) => ({ ...prev, [achievementId]: progress }));
          onProgress?.(progress);
        },
        (error) => {
          console.error(`Upload error for certificate ${achievementId}:`, error);
          setUploadingCertificates((prev) => ({ ...prev, [achievementId]: false }));
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadingCertificates((prev) => ({ ...prev, [achievementId]: false }));
            setUploadProgress((prev) => ({ ...prev, [achievementId]: 0 }));
            resolve(downloadURL);
          } catch (error) {
            console.error(`Error getting download URL for certificate ${achievementId}:`, error);
            setUploadingCertificates((prev) => ({ ...prev, [achievementId]: false }));
            reject(error);
          }
        }
      );
    });
  };

  const handleSave = async () => {
    setShowEditModal(false);
    
    const toastId = showToast("Saving changes...", "loading", 0);

    try {
      const updatedData: QuickNavData = {
        ...formData,
        achievements: formData.achievements || [],
        photos: formData.photos || [],
      };
      let totalFiles = 0;
      let completedFiles = 0;

      // Count certificate files to upload
      Object.keys(selectedCertificateFiles).forEach((achievementId) => {
        if (selectedCertificateFiles[achievementId]) totalFiles++;
      });

      // Count photo files to upload
      Object.keys(selectedPhotoFiles).forEach((photoId) => {
        if (selectedPhotoFiles[photoId]) totalFiles++;
      });

      // Upload certificate files
      for (const achievementId of Object.keys(selectedCertificateFiles)) {
        const file = selectedCertificateFiles[achievementId];
        if (!file) continue;

        setUploadingCertificates((prev) => ({ ...prev, [achievementId]: true }));
        try {
          const certificateUrl = await uploadCertificateWithProgress(
            file,
            achievementId,
            (progress) => {
              const overallProgress = totalFiles > 0 
                ? Math.round((completedFiles / totalFiles) * 100 + (progress / totalFiles))
                : progress;
              updateToast(toastId, { progress: overallProgress });
            }
          );

          // Update the achievement with the certificate URL
          const achievementIndex = updatedData.achievements.findIndex(a => a.id === achievementId);
          if (achievementIndex !== -1) {
            updatedData.achievements[achievementIndex] = {
              ...updatedData.achievements[achievementIndex],
              certificateImage: certificateUrl,
              hasCertificate: true,
            };
          }

          completedFiles++;
          const overallProgress = totalFiles > 0 
            ? Math.round((completedFiles / totalFiles) * 100)
            : 100;
          updateToast(toastId, { progress: overallProgress });
        } catch (error) {
          console.error(`Certificate upload error for ${achievementId}:`, error);
          throw new Error(`Failed to upload certificate for ${achievementId}`);
        } finally {
          setUploadingCertificates((prev) => ({ ...prev, [achievementId]: false }));
        }
      }

      // Upload photo files
      for (const photoId of Object.keys(selectedPhotoFiles)) {
        const file = selectedPhotoFiles[photoId];
        if (!file) continue;

        setUploadingPhotos((prev) => ({ ...prev, [photoId]: true }));
        try {
          const photoUrl = await uploadPhotoWithProgress(
            file,
            photoId,
            (progress) => {
              const overallProgress = totalFiles > 0 
                ? Math.round((completedFiles / totalFiles) * 100 + (progress / totalFiles))
                : progress;
              updateToast(toastId, { progress: overallProgress });
            }
          );

          // Update the photo with the image URL
          const photoIndex = updatedData.photos.findIndex(p => p.id === photoId);
          if (photoIndex !== -1) {
            updatedData.photos[photoIndex] = {
              ...updatedData.photos[photoIndex],
              imageUrl: photoUrl,
            };
          }

          completedFiles++;
          const overallProgress = totalFiles > 0 
            ? Math.round((completedFiles / totalFiles) * 100)
            : 100;
          updateToast(toastId, { progress: overallProgress });
        } catch (error) {
          console.error(`Photo upload error for ${photoId}:`, error);
          throw new Error(`Failed to upload photo for ${photoId}`);
        } finally {
          setUploadingPhotos((prev) => ({ ...prev, [photoId]: false }));
        }
      }

      // Save to Firestore
      updateToast(toastId, { message: "Saving to database...", progress: 95 });
      console.log("Saving QuickNav data:", updatedData); // Debug log
      await saveQuickNavData(updatedData);
      setQuickNavData(updatedData);
      setSelectedCertificateFiles({});
      setSelectedPhotoFiles({});
      
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
    // Ensure all arrays are defined when resetting
    setFormData({
      ...quickNavData,
      achievements: quickNavData.achievements || [],
      photos: quickNavData.photos || [],
    });
    setSelectedCertificateFiles({});
    setSelectedPhotoFiles({});
    setUploadProgress({});
    setPhotoUploadProgress({});
    setShowEditModal(false);
  };

  const handleAddAchievement = () => {
    const newAchievement: Achievement = {
      id: `achievement-${Date.now()}`,
      title: "",
      year: "",
      subtitle: "",
      detail: "",
      hasCertificate: false,
    };
    setFormData({
      ...formData,
      achievements: [...formData.achievements, newAchievement],
    });
  };


  // Render autobiography paragraphs
  const autobiographyParagraphs = splitIntoParagraphs(quickNavData.autobiography);

  // Show loading state if data not loaded
  if (loading || !quickNavData) {
    return (
      <div className="grid grid-cols-4 gap-4 items-center justify-center relative">
        {/* Edit Button Skeleton */}
        <div
          className="absolute -top-2 -right-2 z-30 p-2 rounded-lg bg-yellow-400/50 animate-pulse"
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div className="w-5 h-5 bg-gray-900/20 rounded" />
        </div>

        {/* About skeleton - 1 column */}
        <div
          className="inline-flex items-center justify-center rounded-2xl animate-pulse"
          style={{
            width: 64,
            height: 64,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "linear-gradient(180deg, #1e2a4d 0%, #0f1a3a 60%, #0b1530 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 10px 18px -12px rgba(0,0,0,0.6)",
          }}
        >
          <div className="w-9 h-9 bg-white/10 rounded-full" />
        </div>
        {/* Achievement skeleton - 1 column */}
        <div
          className="inline-flex items-center justify-center rounded-2xl animate-pulse"
          style={{
            width: 64,
            height: 64,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "linear-gradient(180deg, #1e2a4d 0%, #0f1a3a 60%, #0b1530 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 10px 18px -12px rgba(0,0,0,0.6)",
          }}
        >
          <div className="w-9 h-9 bg-white/10 rounded-full" />
        </div>
        {/* Wordmark skeleton - 2 columns */}
        <div
          className="col-span-2 h-16 bg-white/10 rounded-2xl animate-pulse"
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4 items-center justify-center relative">
      {/* Edit Button */}
      <button
        onClick={() => setShowEditModal(true)}
        className="absolute -top-2 -right-2 z-30 p-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-lg transition-colors"
        title="Edit QuickNav Section"
        aria-label="Edit QuickNav Section"
        style={{
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* About button - 1 column */}
      <button
        type="button"
        onClick={() => setShowAbout(true)}
        aria-label="About"
        className="inline-flex items-center justify-center rounded-2xl active:translate-y-0.5 transition cr-glass-hover"
        style={{
          width: 64,
          height: 64,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "linear-gradient(180deg, #1e2a4d 0%, #0f1a3a 60%, #0b1530 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 10px 18px -12px rgba(0,0,0,0.6)",
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 6.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" fill="white"/>
          <path d="M6 18.5c0-3.3137 2.6863-6 6-6s6 2.6863 6 6" fill="white" opacity=".9"/>
        </svg>
      </button>

      {/* Achievement/Trophy button - 1 column */}
      <button
        type="button"
        aria-label="Achievements"
        onClick={() => setShowTrophyModal(true)}
        className="inline-flex items-center justify-center rounded-2xl active:translate-y-0.5 transition cr-glass-hover"
        style={{
          width: 64,
          height: 64,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "linear-gradient(180deg, #1e2a4d 0%, #0f1a3a 60%, #0b1530 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 10px 18px -12px rgba(0,0,0,0.6)",
        }}
      >
        <Image src="/cr-trophy.svg" alt="Trophy" width={36} height={36} />
      </button>

      {/* Wordmark - 2 columns */}
      <div className="col-span-2 flex items-center justify-center">
        <Image 
          src="/logos/Wordmark.png" 
          alt="Wordmark" 
          width={200} 
          height={64}
          className="h-16 w-auto object-contain"
        />
      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[110] grid place-items-center" role="dialog" aria-modal="true" aria-label="About">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAbout(false)} />
          <div className="relative z-[111] w-[min(94vw,640px)] lg:w-[min(94vw,900px)] h-auto lg:h-[85vh] max-h-[90vh] lg:max-h-[85vh] rounded-[28px] overflow-hidden flex flex-col" style={{
            background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
            transform: `scale(${aboutScale})`,
            transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
          }}>
            <div className="relative flex items-center px-6 py-7" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            }}>
              <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide" style={{
                textTransform: "uppercase",
                textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45), -1px -1px 0 #1c2744, 1px -1px 0 #1c2744, -1px 1px 0 #1c2744, 1px 1px 0 #1c2744",
                letterSpacing: 1,
              }}>About</div>
              <button
                type="button"
                onClick={() => setShowAbout(false)}
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
                <span className="text-white font-extrabold" style={{
                  textShadow: "0 1px 0 rgba(0,0,0,0.3)",
                  lineHeight: 1,
                }}>x</span>
              </button>
            </div>
            {/* Inner content container area (tabs + panel) */}
            <div className="px-4 pb-6 pt-2 flex-1 flex flex-col min-h-0" style={{
              background: "linear-gradient(360deg, #808a99 0%, #6b7586 100%)"
            }}>
              {/* Segmented tabs (rail + raised tabs) */}
              <div className="w-full">
                {/* Rail */}
                <div className="h-12 " style={{
                  background: "linear-gradient(180deg, #5a6576 0%, #475260 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                }} />
                {/* Tabs centered overlapping the rail */}
                <div className="-mt-[38px] px-2 flex items-end justify-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => setAboutTab("about")}
                    className="px-6 py-2 rounded-t-xl text-sm font-extrabold min-w-28"
                    style={aboutTab === "about" ? {
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
                  >Me</button>
                  <button
                    type="button"
                    onClick={() => setAboutTab("links")}
                    className="px-6 py-2 rounded-t-xl text-sm font-extrabold min-w-28"
                    style={aboutTab === "links" ? {
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
                  >Photos</button>
                </div>
              </div>


              {/* Content panel wrapper */}
              <div className="mt-4 rounded-xl flex-1 min-h-0 overflow-y-auto" style={{
                background: "linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%)",
                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                padding: 12,
              }}>
              {/* Content card list style */}
              <div className="grid gap-3 h-full">
                  {aboutTab === "about" ? (
                    <div className="rounded-lg px-4 py-3 h-full" style={{
                      background: "transparent",
                      color: "#25355d",
                      fontSize: 14,
                      lineHeight: 1.7,
                      paddingRight: "8px",
                    }}>
                      {loading ? (
                        <div className="text-center text-[#233457]/60">Loading...</div>
                      ) : (
                        autobiographyParagraphs.map((paragraph, index) => (
                          <p key={index} style={{ marginBottom: "1em" }}>
                            {paragraph}
                          </p>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg px-4 py-3 h-full" style={{
                      background: "transparent",
                      color: "#25355d",
                      fontSize: 14,
                      lineHeight: 1.7,
                      paddingRight: "8px",
                    }}>
                      {loading ? (
                        <div className="text-center text-[#233457]/60 py-8">Loading photos...</div>
                      ) : (!quickNavData.photos || quickNavData.photos.length === 0) ? (
                        <div className="text-center font-extrabold py-8" style={{
                          background: "linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%)",
                          border: "1px solid rgba(0,0,0,0.12)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                          color: "#25355d",
                          borderRadius: 12,
                        }}>
                          📸 Arena photographers are gearing up. Photos coming soon!
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {(quickNavData.photos || []).map((photo) => (
                            <div
                              key={photo.id}
                              className="rounded-lg overflow-hidden border border-[#233457]/20"
                              style={{
                                background: "linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%)",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                              }}
                            >
                              <div className="relative w-full aspect-video bg-[#233457]/10">
                                {photo.imageUrl ? (
                                  <Image
                                    src={photo.imageUrl}
                                    alt={photo.title || photo.caption || "Photo"}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-[#233457]/40">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
                                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
                                    </svg>
                                  </div>
                                )}
                              </div>
                              {photo.title && (
                                <div className="px-3 py-2 text-sm font-semibold text-[#233457] border-t border-[#233457]/10">
                                  {photo.title}
                                </div>
                              )}
                              {photo.caption && (
                                <div className="px-3 py-2 text-xs text-[#233457]/80 border-t border-[#233457]/10">
                                  {photo.caption}
                                </div>
                              )}
                              {photo.imageUrl && (
                                <div className="px-3 py-2 border-t border-[#233457]/10">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedPhoto(photo);
                                      setShowPhotoPreviewModal(true);
                                    }}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold text-white active:translate-y-0.5 transition cr-glass-hover w-full"
                                    style={{
                                      border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                                      background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                                    }}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                      <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                    <span className="truncate">View Photo</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trophy/Achievement Modal */}
      {showTrophyModal && (
        <div className="fixed inset-0 z-[110] grid place-items-center p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="Achievements">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTrophyModal(false)} />
          <div className="relative z-[111] w-full max-w-[96vw] sm:max-w-[820px] rounded-[16px] sm:rounded-[24px] overflow-hidden max-h-[95vh] overflow-y-auto" style={{
            background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
            transform: `scale(${trophyScale})`,
            transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
          }}>
            <div className="relative flex items-center px-3 py-3 sm:px-6 sm:py-6" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            }}>
              <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide text-[10px] sm:text-sm px-2 text-center max-w-[calc(100%-80px)] truncate" style={{
                textTransform: "uppercase",
                textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45), -1px -1px 0 #1c2744, 1px -1px 0 #1c2744, -1px 1px 0 #1c2744, 1px 1px 0 #1c2744",
                letterSpacing: 1,
              }}>Achievements & Tournaments</div>
              <button
                type="button"
                onClick={() => setShowTrophyModal(false)}
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
                {(!quickNavData.achievements || quickNavData.achievements.length === 0) ? (
                  <div className="text-center font-extrabold py-8" style={{
                    background: "linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%)",
                    border: "1px solid rgba(0,0,0,0.12)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                    color: "#25355d",
                    borderRadius: 12,
                  }}>
                    🏆 No achievements available yet.
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {(quickNavData.achievements || []).map((achievement) => (
                    <div
                      key={achievement.id}
                      className="rounded-lg p-3"
                      style={{
                        border: "1px solid rgba(0,0,0,0.12)",
                        background: "linear-gradient(180deg, #f5f9ff 0%, #e3ecfb 40%, #cfdbf1 100%)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), 0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-sm font-semibold text-[#233457]">{achievement.title}</div>
                            <span className="px-2 py-0.5 rounded text-xs font-bold text-white" style={{
                              background: achievement.id === "HackforGov" 
                                ? "linear-gradient(180deg, #10b981 0%, #059669 60%, #047857 100%)"
                                : "linear-gradient(180deg, #3b82f6 0%, #2563eb 60%, #1d4ed8 100%)",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)",
                            }}>{achievement.year}</span>
                          </div>
                          <div className="text-xs text-[#233457]/75 mt-1">{achievement.subtitle}</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 mb-3">
                        {achievement.hasCertificate && achievement.certificateImage && (
                          <button
                            type="button"
                            onClick={() => setShowPhotoModal(true)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold text-white active:translate-y-0.5 transition cr-glass-hover flex-1"
                            style={{
                              border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                              background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
                            </svg>
                            <span className="truncate">View Certificate</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setExpandedAchievement(expandedAchievement === achievement.id ? null : achievement.id)}
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
                              transform: expandedAchievement === achievement.id ? "rotate(180deg)" : "rotate(0deg)",
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
                          maxHeight: expandedAchievement === achievement.id ? "500px" : "0",
                          opacity: expandedAchievement === achievement.id ? 1 : 0,
                        }}
                      >
                        <div className="pt-2 border-t border-[#233457]/20">
                          <p className="text-xs text-[#233457]/80 leading-relaxed mt-2" style={{ whiteSpace: "pre-line" }}>
                            {achievement.detail}
                          </p>
                        </div>
                      </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal for Certificate */}
      {showPhotoModal && (() => {
        const achievementWithCert = selectedCertificateAchievement || quickNavData.achievements.find(a => a.hasCertificate && a.certificateImage);
        if (!achievementWithCert?.certificateImage) return null;
        
        return (
          <div className="fixed inset-0 z-[220] grid place-items-center p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="Certificate Photo">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => {
              setShowPhotoModal(false);
              setSelectedCertificateAchievement(null);
            }} />
            <div className="relative z-[221] w-full max-w-[95vw] sm:max-w-[1200px] h-[min(95vh,800px)] max-h-[95vh] rounded-[16px] sm:rounded-[24px] overflow-hidden" style={{
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
                }}>{achievementWithCert.title} Certificate</div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPhotoModal(false);
                    setSelectedCertificateAchievement(null);
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
              <div className="px-2 pb-2 pt-2 sm:px-6 sm:pb-6 sm:pt-4 h-[calc(100%-60px)] sm:h-[calc(100%-80px)] flex items-center justify-center bg-[#1a1a1a] overflow-auto">
                <div className="relative w-full h-full flex items-center justify-center rounded-lg sm:rounded-xl overflow-hidden">
                  <Image
                    src={achievementWithCert.certificateImage}
                    alt={`${achievementWithCert.title} Certificate`}
                    fill
                    className="object-contain"
                    onClick={(e) => e.stopPropagation()}
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[200] grid place-items-center p-1 sm:p-4" role="dialog" aria-modal="true" aria-label="Edit QuickNav Section">
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
              }}>Edit QuickNav</div>
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
                    onClick={() => setEditTab("about")}
                    className="px-3 py-1.5 sm:px-6 sm:py-2 rounded-t-xl text-[10px] sm:text-sm font-extrabold min-w-[60px] sm:min-w-28"
                    style={editTab === "about" ? {
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
                  >Me</button>
                  <button
                    type="button"
                    onClick={() => setEditTab("photos")}
                    className="px-3 py-1.5 sm:px-6 sm:py-2 rounded-t-xl text-[10px] sm:text-sm font-extrabold min-w-[60px] sm:min-w-28"
                    style={editTab === "photos" ? {
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
                  >Photos</button>
                  <button
                    type="button"
                    onClick={() => setEditTab("achievements")}
                    className="px-3 py-1.5 sm:px-6 sm:py-2 rounded-t-xl text-[10px] sm:text-sm font-extrabold min-w-[70px] sm:min-w-28"
                    style={editTab === "achievements" ? {
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
                  >Achievements</button>
                </div>
              </div>

              {/* Content panel wrapper */}
              <div className="mt-2 sm:mt-4 rounded-xl flex-1 min-h-0 overflow-y-auto" style={{
                background: "linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%)",
                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                padding: "8px",
              }}>
                <div className="space-y-3 sm:space-y-4">
                  {/* Me Tab - Autobiography */}
                  {editTab === "about" && (
                    <>
                      {/* Autobiography Field */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-[#233457] mb-1.5">
                          Autobiography
                        </label>
                        <textarea
                          value={formData.autobiography}
                          onChange={(e) => setFormData({ ...formData, autobiography: e.target.value })}
                          className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                          placeholder="Enter your autobiography"
                          rows={8}
                          style={{ resize: "vertical" }}
                        />
                        <p className="text-[10px] sm:text-xs text-[#233457]/60 mt-1">Enter your autobiography text. Use double line breaks to separate paragraphs.</p>
                      </div>
                    </>
                  )}

                  {/* Photos Tab */}
                  {editTab === "photos" && (
                    <div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                        <label className="block text-xs sm:text-sm font-semibold text-[#233457]">
                          Photos
                        </label>
                        <button
                          type="button"
                          onClick={handleAddPhoto}
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
                          <span>Add Photo</span>
                        </button>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        {(formData.photos || []).map((photo, index) => (
                          <div
                            key={photo.id}
                            className="rounded-lg p-2.5 sm:p-4 border border-[#233457]/20 bg-white/50 relative"
                          >
                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="absolute top-2 right-2 p-1.5 rounded-md text-white hover:bg-red-600 transition-colors"
                              style={{
                                background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 55%, #b73838 100%)",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                              }}
                              title="Delete Photo"
                              aria-label="Delete Photo"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>

                            {/* Photo Image Upload */}
                            <div className="mb-3 sm:mb-4">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Photo Image
                              </label>
                              <div className="space-y-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handlePhotoSelect(photo.id, e.target.files?.[0] || null)}
                                  className="w-full px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent file:mr-2 sm:file:mr-4 file:py-1 file:px-2 sm:file:px-3 file:rounded-md file:border-0 file:text-[10px] sm:file:text-xs file:font-semibold file:bg-[#5ea0ff] file:text-white hover:file:bg-[#2f66d0] file:cursor-pointer"
                                  disabled={uploadingPhotos[photo.id]}
                                />
                                {selectedPhotoFiles[photo.id] && (
                                  <>
                                    <div className="text-xs text-[#233457]/70">
                                      Selected: {selectedPhotoFiles[photo.id].name} ({(selectedPhotoFiles[photo.id].size / 1024 / 1024).toFixed(2)} MB)
                                    </div>
                                    <PhotoPreview file={selectedPhotoFiles[photo.id]} />
                                  </>
                                )}
                                {photo.imageUrl && !selectedPhotoFiles[photo.id] && (
                                  <div className="mt-2 relative w-full h-64 rounded-md border border-[#233457]/20 overflow-hidden">
                                    <Image
                                      src={photo.imageUrl}
                                      alt={photo.title || photo.caption || "Photo"}
                                      fill
                                      className="object-contain"
                                      unoptimized
                                    />
                                    <div className="text-xs text-[#233457]/70 mt-1">
                                      Current: <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedPhoto(photo);
                                          setShowPhotoPreviewModal(true);
                                        }}
                                        className="text-[#5ea0ff] hover:underline cursor-pointer"
                                      >
                                        View Photo
                                      </button>
                                    </div>
                                  </div>
                                )}
                                {uploadingPhotos[photo.id] && (
                                  <div className="w-full bg-[#233457]/10 rounded-md h-2 overflow-hidden">
                                    <div
                                      className="h-full bg-[#5ea0ff] transition-all duration-300"
                                      style={{ width: `${photoUploadProgress[photo.id] || 0}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                              <p className="text-[10px] sm:text-xs text-[#233457]/60 mt-1">Upload an image file (max 10MB)</p>
                            </div>

                            {/* Title Field */}
                            <div className="mb-3 sm:mb-4">
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Title
                              </label>
                              <input
                                type="text"
                                value={photo.title}
                                onChange={(e) => {
                                  const updated = [...formData.photos];
                                  updated[index] = { ...photo, title: e.target.value };
                                  setFormData({ ...formData, photos: updated });
                                }}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="Enter photo title"
                              />
                            </div>

                            {/* Caption Field */}
                            <div>
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Caption
                              </label>
                              <input
                                type="text"
                                value={photo.caption}
                                onChange={(e) => {
                                  const updated = [...formData.photos];
                                  updated[index] = { ...photo, caption: e.target.value };
                                  setFormData({ ...formData, photos: updated });
                                }}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="Enter photo caption"
                              />
                            </div>
                          </div>
                        ))}
                        {formData.photos.length === 0 && (
                          <div className="text-center py-8 text-[#233457]/60 text-sm">
                            No photos yet. Click &quot;Add Photo&quot; to add one.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Achievements Tab */}
                  {editTab === "achievements" && (
                    <div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                        <label className="block text-xs sm:text-sm font-semibold text-[#233457]">
                          Achievements
                        </label>
                        <button
                          type="button"
                          onClick={handleAddAchievement}
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
                          <span>Add Achievement</span>
                        </button>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        {(formData.achievements || []).map((achievement, index) => (
                        <div
                          key={achievement.id}
                          className="rounded-lg p-2.5 sm:p-4 border border-[#233457]/20 bg-white/50 relative"
                        >
                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteAchievement(achievement.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-md text-white hover:bg-red-600 transition-colors"
                            style={{
                              background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 55%, #b73838 100%)",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                            }}
                            title="Delete Achievement"
                            aria-label="Delete Achievement"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                            {/* Title */}
                            <div>
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Title
                              </label>
                              <input
                                type="text"
                                value={achievement.title}
                                onChange={(e) => {
                                  const updated = [...formData.achievements];
                                  updated[index] = { ...achievement, title: e.target.value };
                                  setFormData({ ...formData, achievements: updated });
                                }}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="Achievement title"
                              />
                            </div>

                            {/* Year */}
                            <div>
                              <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                                Year
                              </label>
                              <input
                                type="text"
                                value={achievement.year}
                                onChange={(e) => {
                                  const updated = [...formData.achievements];
                                  updated[index] = { ...achievement, year: e.target.value };
                                  setFormData({ ...formData, achievements: updated });
                                }}
                                className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                                placeholder="Year"
                              />
                            </div>
                          </div>

                          {/* Subtitle */}
                          <div className="mb-3 sm:mb-4">
                            <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                              Subtitle
                            </label>
                            <input
                              type="text"
                              value={achievement.subtitle}
                              onChange={(e) => {
                                const updated = [...formData.achievements];
                                updated[index] = { ...achievement, subtitle: e.target.value };
                                setFormData({ ...formData, achievements: updated });
                              }}
                              className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                              placeholder="Achievement subtitle"
                            />
                          </div>

                          {/* Detail */}
                          <div className="mb-3 sm:mb-4">
                            <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                              Detail
                            </label>
                            <textarea
                              value={achievement.detail}
                              onChange={(e) => {
                                const updated = [...formData.achievements];
                                updated[index] = { ...achievement, detail: e.target.value };
                                setFormData({ ...formData, achievements: updated });
                              }}
                              className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                              placeholder="Achievement details"
                              rows={4}
                              style={{ resize: "vertical" }}
                            />
                          </div>

                          {/* Certificate Image Upload */}
                          <div>
                            <label className="block text-xs font-semibold text-[#233457] mb-1.5">
                              Certificate Image {achievement.hasCertificate ? "(Optional)" : ""}
                            </label>
                            <div className="space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleCertificateSelect(achievement.id, e.target.files?.[0] || null)}
                                className="w-full px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent file:mr-2 sm:file:mr-4 file:py-1 file:px-2 sm:file:px-3 file:rounded-md file:border-0 file:text-[10px] sm:file:text-xs file:font-semibold file:bg-[#5ea0ff] file:text-white hover:file:bg-[#2f66d0] file:cursor-pointer"
                                disabled={uploadingCertificates[achievement.id]}
                              />
                              {selectedCertificateFiles[achievement.id] && (
                                <>
                                  <div className="text-xs text-[#233457]/70">
                                    Selected: {selectedCertificateFiles[achievement.id].name} ({(selectedCertificateFiles[achievement.id].size / 1024 / 1024).toFixed(2)} MB)
                                  </div>
                                  <CertificatePreview file={selectedCertificateFiles[achievement.id]} />
                                </>
                              )}
                              {achievement.certificateImage && !selectedCertificateFiles[achievement.id] && (
                                <div className="text-xs text-[#233457]/70">
                                  Current: <button
                                    type="button"
                                    onClick={() => {
                                      // Set the achievement to view its certificate
                                      setSelectedCertificateAchievement(achievement);
                                      setShowPhotoModal(true);
                                    }}
                                    className="text-[#5ea0ff] hover:underline cursor-pointer"
                                  >
                                    View Certificate
                                  </button>
                                </div>
                              )}
                              {uploadingCertificates[achievement.id] && (
                                <div className="w-full bg-[#233457]/10 rounded-md h-2 overflow-hidden">
                                  <div
                                    className="h-full bg-[#5ea0ff] transition-all duration-300"
                                    style={{ width: `${uploadProgress[achievement.id] || 0}%` }}
                                  />
                                </div>
                              )}
                            </div>
                            <p className="text-[10px] sm:text-xs text-[#233457]/60 mt-1">Upload an image file (max 10MB)</p>
                          </div>
                        </div>
                        ))}
                        {(!formData.achievements || formData.achievements.length === 0) && (
                          <div className="text-center py-8 text-[#233457]/60 text-sm">
                            No achievements yet. Click &quot;Add Achievement&quot; to add one.
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
                    disabled={Object.values(uploadingCertificates).some(u => u) || Object.values(uploadingPhotos).some(u => u)}
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

      {/* Photo Preview Modal */}
      {showPhotoPreviewModal && selectedPhoto && (
        <div className="fixed inset-0 z-[220] grid place-items-center p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="Photo Preview">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPhotoPreviewModal(false)} />
          <div className="relative z-[221] w-full max-w-[95vw] sm:max-w-[1200px] h-[min(95vh,800px)] max-h-[95vh] rounded-[16px] sm:rounded-[24px] overflow-hidden" style={{
            background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
            transform: `scale(${photoPreviewScale})`,
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
                {selectedPhoto.title || selectedPhoto.caption || "Photo"}
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoPreviewModal(false)}
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
            <div className="px-2 pb-2 pt-2 sm:px-6 sm:pb-6 sm:pt-4 h-[calc(100%-60px)] sm:h-[calc(100%-80px)] flex items-center justify-center bg-[#1a1a1a] overflow-auto">
              <div className="relative w-full h-full flex items-center justify-center rounded-lg sm:rounded-xl overflow-hidden">
                {selectedPhoto.imageUrl && (
                  <Image
                    src={selectedPhoto.imageUrl}
                    alt={selectedPhoto.caption || "Photo"}
                    fill
                    className="object-contain"
                    onClick={(e) => e.stopPropagation()}
                    unoptimized
                  />
                )}
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
                Delete {deleteType === "photo" ? "Photo" : "Achievement"}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteType(null);
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
                  Are you sure you want to delete this {deleteType === "photo" ? "photo" : "achievement"}? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteType(null);
                    setDeleteId(null);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-semibold text-white active:translate-y-0.5 transition cr-glass-hover flex-1"
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
                  className="inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-semibold text-white active:translate-y-0.5 transition cr-glass-hover flex-1"
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
    </div>
  );
}
