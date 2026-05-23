"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import type React from "react";
import Card from "@/components/ui/Card";
import { storage, auth } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getHeroData, saveHeroData, type HeroData } from "@/lib/hero-data";
import { showToast, updateToast, removeToast } from "@/components/ui/Toast";

// Preview components for file uploads
function BannerPreview({ file }: { file: File }) {
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
      <div className="relative w-full h-32 rounded-md overflow-hidden border border-[#233457]/20 bg-[#233457]/10 flex items-center justify-center">
        <div className="text-xs text-[#233457]/50">Loading preview...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-32 rounded-md overflow-hidden border border-[#233457]/20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={previewUrl} 
        alt="Banner preview" 
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error("Error loading preview image");
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}

function ProfilePreview({ file }: { file: File }) {
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
      <div className="relative w-32 h-32 rounded-md overflow-hidden border border-[#233457]/20 bg-[#233457]/10 flex items-center justify-center">
        <div className="text-xs text-[#233457]/50">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative w-32 h-32 rounded-md overflow-hidden border border-[#233457]/20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={previewUrl} 
        alt="Profile preview" 
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error("Error loading preview image");
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}

export default function HeroAdmin() {
  const [showReveal, setShowReveal] = useState(false);
  const [revealVars, setRevealVars] = useState<{ x: number; y: number; scale: number; rot: number } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editScale, setEditScale] = useState(0.96);
  const editTimerRef = useRef<number | null>(null);
  const avatarRef = useRef<HTMLButtonElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [revealPhase, setRevealPhase] = useState<"legend" | "profile">("legend");
  const [isCentered, setIsCentered] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const phaseTimeoutRef = useRef<number | null>(null);
  const spinStartRef = useRef<number | null>(null);

  // Hero content state
  const [heroData, setHeroData] = useState<HeroData>({
    name: "Sonny Sarcia",
    location: "Pinamalayan, Oriental Mindoro",
    jobTitle: "Full Stack Developer",
    email: "sonnypsarcia@gmail.com",
    resumeUrl: "/files/Sarcia_Resume.pdf",
    bannerImage: "/LoongDrakeBG.png",
    profilePhoto: "/SONNY_PHOTO.png",
  });
  const [loading, setLoading] = useState(true);

  // Load hero data from Firebase on mount
  useEffect(() => {
    const loadHeroData = async () => {
      try {
        setLoading(true);
        const data = await getHeroData();
        setHeroData(data);
      } catch (error) {
        console.error("Error loading hero data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHeroData();
  }, []);

  // Form state for editing
  const [formData, setFormData] = useState<HeroData>(heroData);

  // File upload states
  const [uploading, setUploading] = useState({
    banner: false,
    profile: false,
  });
  const [uploadProgress, setUploadProgress] = useState({
    banner: 0,
    profile: 0,
  });
  const [selectedFiles, setSelectedFiles] = useState<{
    banner?: File;
    profile?: File;
  }>({});

  // States for tailored resumes
  const [selectedTailoredFiles, setSelectedTailoredFiles] = useState<Record<number, File>>({});
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeScale, setResumeScale] = useState(0.96);

  useEffect(() => {
    if (!showResumeModal) return;
    setResumeScale(0.96);
    const raf = requestAnimationFrame(() => {
      setResumeScale(1.06);
      const timer = window.setTimeout(() => {
        setResumeScale(1.0);
      }, 120);
      return () => window.clearTimeout(timer);
    });
    return () => cancelAnimationFrame(raf);
  }, [showResumeModal]);

  // Handlers for tailored resumes in edit form
  const handleAddTailoredResume = () => {
    const newList = formData.resumes ? [...formData.resumes] : [];
    newList.push({ label: "", url: "" });
    setFormData({ ...formData, resumes: newList });
  };

  const handleRemoveTailoredResume = (indexToRemove: number) => {
    if (!formData.resumes) return;
    const newList = formData.resumes.filter((_, idx) => idx !== indexToRemove);
    
    // Also remove from selected files
    setSelectedTailoredFiles((prev) => {
      const copy = { ...prev };
      delete copy[indexToRemove];
      // shift remaining keys down to match new indices
      const shifted: Record<number, File> = {};
      Object.keys(copy).forEach((k) => {
        const idx = parseInt(k, 10);
        if (idx > indexToRemove) {
          shifted[idx - 1] = copy[idx];
        } else {
          shifted[idx] = copy[idx];
        }
      });
      return shifted;
    });

    setFormData({ ...formData, resumes: newList });
  };

  const handleTailoredResumeLabelChange = (indexToUpdate: number, newLabel: string) => {
    if (!formData.resumes) return;
    const newList = formData.resumes.map((item, idx) =>
      idx === indexToUpdate ? { ...item, label: newLabel } : item
    );
    setFormData({ ...formData, resumes: newList });
  };

  const handleTailoredResumeFileSelect = (indexToUpdate: number, file: File | null) => {
    if (!file) {
      setSelectedTailoredFiles((prev) => {
        const copy = { ...prev };
        delete copy[indexToUpdate];
        return copy;
      });
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File size must be less than 5MB.");
      return;
    }

    setSelectedTailoredFiles((prev) => ({ ...prev, [indexToUpdate]: file }));
  };

  const openResume = (e?: React.MouseEvent<HTMLAnchorElement>) => {
    e?.preventDefault();
    if (heroData?.resumes && heroData.resumes.length > 1) {
      setShowResumeModal(true);
    } else if (heroData?.resumes && heroData.resumes.length === 1) {
      const newTab = window.open(heroData.resumes[0].url, "_blank");
      newTab?.focus();
    } else if (heroData?.resumeUrl) {
      const newTab = window.open(heroData.resumeUrl, "_blank");
      newTab?.focus();
    } else {
      alert("No resume is currently available.");
    }
  };

  const closeReveal = () => {
    cardRef.current?.classList.remove("cr-reveal-final");
    wrapperRef.current?.classList.remove("cr-flip-easeout");
    if (spinStartRef.current) {
      clearTimeout(spinStartRef.current);
      spinStartRef.current = null;
    }
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
    setRevealPhase("legend");
    window.setTimeout(() => { setShowReveal(false); setHasRevealed(true); }, 750);
    setCelebrate(false);
  };

  useEffect(() => {
    if (!showReveal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeReveal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showReveal]);

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
      setFormData(heroData);
    }
  }, [showEditModal, heroData]);



  const handleFileSelect = (type: "banner" | "profile", file: File | null) => {
    if (!file) {
      setSelectedFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[type];
        return newFiles;
      });
      return;
    }

    // Validate file types
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // Validate file size (max 10MB for images)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size must be less than 10MB.");
      return;
    }

    // Create a new file reference to ensure React detects the change
    setSelectedFiles((prev) => ({ ...prev, [type]: file }));
  };

  const handleSave = async () => {
    // Close modal immediately
    setShowEditModal(false);
    
    // Show loading toast
    const toastId = showToast("Saving changes...", "loading", 0);

    try {
      // Validate tailored resumes
      if (formData.resumes) {
        for (let i = 0; i < formData.resumes.length; i++) {
          const r = formData.resumes[i];
          if (!r.label.trim()) {
            removeToast(toastId);
            showToast("All resume versions must have a label.", "error");
            return;
          }
          if (!r.url && !selectedTailoredFiles[i]) {
            removeToast(toastId);
            showToast(`Please upload a PDF file for "${r.label}".`, "error");
            return;
          }
        }
      }

      const updatedData = { ...formData };
      let totalFiles = 0;
      let completedFiles = 0;

      // Count files to upload
      if (selectedFiles.banner) totalFiles++;
      if (selectedFiles.profile) totalFiles++;
      Object.keys(selectedTailoredFiles).forEach(() => totalFiles++);

      // Upload files if selected
      if (selectedFiles.banner) {
        setUploading((prev) => ({ ...prev, banner: true }));
        try {
          const bannerUrl = await uploadFileWithProgress(
            selectedFiles.banner,
            `hero/banner-${Date.now()}.${selectedFiles.banner.name.split('.').pop()}`,
            "banner",
            (progress) => {
              const overallProgress = totalFiles > 0 
                ? Math.round((completedFiles / totalFiles) * 100 + (progress / totalFiles))
                : progress;
              updateToast(toastId, { progress: overallProgress });
            }
          );
          updatedData.bannerImage = bannerUrl;
          completedFiles++;
          const overallProgress = totalFiles > 0 
            ? Math.round((completedFiles / totalFiles) * 100)
            : 100;
          updateToast(toastId, { progress: overallProgress });
        } catch (error) {
          console.error("Banner upload error:", error);
          throw new Error("Failed to upload banner image");
        } finally {
          setUploading((prev) => ({ ...prev, banner: false }));
        }
      }

      if (selectedFiles.profile) {
        setUploading((prev) => ({ ...prev, profile: true }));
        try {
          const profileUrl = await uploadFileWithProgress(
            selectedFiles.profile,
            `hero/profile-${Date.now()}.${selectedFiles.profile.name.split('.').pop()}`,
            "profile",
            (progress) => {
              const overallProgress = totalFiles > 0 
                ? Math.round((completedFiles / totalFiles) * 100 + (progress / totalFiles))
                : progress;
              updateToast(toastId, { progress: overallProgress });
            }
          );
          updatedData.profilePhoto = profileUrl;
          completedFiles++;
          const overallProgress = totalFiles > 0 
            ? Math.round((completedFiles / totalFiles) * 100)
            : 100;
          updateToast(toastId, { progress: overallProgress });
        } catch (error) {
          console.error("Profile upload error:", error);
          throw new Error("Failed to upload profile photo");
        } finally {
          setUploading((prev) => ({ ...prev, profile: false }));
        }
      }

      // Upload tailored resumes
      let resumesList = formData.resumes ? [...formData.resumes] : [];
      for (const key of Object.keys(selectedTailoredFiles)) {
        const idx = parseInt(key, 10);
        const file = selectedTailoredFiles[idx];
        if (!file) continue;

        try {
          const fileUrl = await uploadFileWithProgress(
            file,
            `hero/resume-tailored-${idx}-${Date.now()}.pdf`,
            "resume",
            (progress) => {
              const overallProgress = totalFiles > 0 
                ? Math.round((completedFiles / totalFiles) * 100 + (progress / totalFiles))
                : progress;
              updateToast(toastId, { progress: overallProgress });
            }
          );
          
          resumesList[idx] = {
            ...resumesList[idx],
            url: fileUrl
          };
          completedFiles++;
          const overallProgress = totalFiles > 0 
            ? Math.round((completedFiles / totalFiles) * 100)
            : 100;
          updateToast(toastId, { progress: overallProgress });
        } catch (error) {
          console.error(`Tailored resume upload error at index ${idx}:`, error);
          throw new Error(`Failed to upload resume version "${resumesList[idx]?.label || idx}"`);
        }
      }

      updatedData.resumes = resumesList;
      updatedData.resumeUrl = resumesList[0]?.url || "";

      // Update hero data and save to Firestore
      updateToast(toastId, { message: "Saving to database...", progress: 95 });
      await saveHeroData(updatedData);
      setHeroData(updatedData);
      setSelectedFiles({});
      setSelectedTailoredFiles({});
      
      // Show success toast
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

  // Upload file with progress callback
  const uploadFileWithProgress = async (
    file: File,
    path: string,
    type: "banner" | "profile" | "resume",
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    if (!storage) {
      throw new Error("Firebase Storage is not initialized");
    }

    if (!auth) {
      throw new Error("Firebase Auth is not initialized");
    }

    // Ensure user is authenticated before uploading
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be authenticated to upload files");
    }

    // Get fresh ID token to ensure authentication
    try {
      await user.getIdToken(true); // Force refresh
    } catch {
      throw new Error("Failed to authenticate user");
    }

    return new Promise((resolve, reject) => {
      const storageRef = ref(storage!, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress((prev) => ({ ...prev, [type]: progress }));
          onProgress?.(progress);
        },
        (error) => {
          console.error(`Upload error for ${type}:`, error);
          setUploading((prev) => ({ ...prev, [type]: false }));
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploading((prev) => ({ ...prev, [type]: false }));
            setUploadProgress((prev) => ({ ...prev, [type]: 0 }));
            resolve(downloadURL);
          } catch (error) {
            console.error(`Error getting download URL for ${type}:`, error);
            setUploading((prev) => ({ ...prev, [type]: false }));
            reject(error);
          }
        }
      );
    });
  };

  const handleCancel = () => {
    setFormData(heroData);
    setSelectedFiles({});
    setSelectedTailoredFiles({});
    setUploadProgress({ banner: 0, profile: 0 });
    setShowEditModal(false);
  };

  useEffect(() => {
    if (!showReveal || !cardRef.current) return;
    const id = requestAnimationFrame(() => {
      cardRef.current?.classList.add("cr-reveal-final");
    });
    return () => cancelAnimationFrame(id);
  }, [showReveal]);

  useEffect(() => {
    if (!showReveal) return;
    wrapperRef.current?.classList.remove("cr-flip-easeout");
    setIsCentered(false);
    if (spinStartRef.current) {
      clearTimeout(spinStartRef.current);
      spinStartRef.current = null;
    }
    spinStartRef.current = window.setTimeout(() => {
      if (!showReveal) return;
      setIsCentered(true);
      wrapperRef.current?.classList.add("cr-flip-easeout");
    }, 800);
    return () => {
      if (spinStartRef.current) {
        clearTimeout(spinStartRef.current);
        spinStartRef.current = null;
      }
    };
  }, [showReveal]);

  useEffect(() => {
    if (!showReveal) return;
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
    if (revealPhase === "legend") {
      phaseTimeoutRef.current = window.setTimeout(() => {
        setRevealPhase("profile");
        setCelebrate(true);
        window.setTimeout(() => setCelebrate(false), 1200);
      }, 4200);
    }
    return () => {
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current);
        phaseTimeoutRef.current = null;
      }
    };
  }, [showReveal, revealPhase]);

  const openReveal = () => {
    cardRef.current?.classList.remove("cr-reveal-final");
    setRevealPhase("legend");
    setIsCentered(false);
    const targetW = 280;
    const targetH = 360;
    const rect = avatarRef.current?.getBoundingClientRect();
    if (rect) {
      const scale = Math.min(rect.width / targetW, rect.height / targetH);
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const tx = cx - window.innerWidth / 2;
      const ty = cy - window.innerHeight / 2;
      setRevealVars({ x: tx, y: ty, scale, rot: -18 });
    } else {
      setRevealVars({ x: 0, y: 0, scale: 0.4, rot: -18 });
    }
    setShowReveal(true);
  };

  // Show loading state if data not loaded (AFTER all hooks)
  if (loading || !heroData) {
    return (
      <Card borderless className="col-span-full lg:col-span-7 xl:col-span-8 relative">
        {/* Edit Button */}
        <button
          onClick={() => setShowEditModal(true)}
          className="absolute top-2 right-2 z-30 p-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-lg transition-colors"
          title="Edit Hero Section"
          aria-label="Edit Hero Section"
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div
          className="relative overflow-hidden rounded-tl-xl rounded-tr-none rounded-br-xl rounded-bl-xl"
          style={{
            background: "transparent",
            borderTop: "1px solid rgba(255,255,255,0.16)",
            borderLeft: "1px solid rgba(255,255,255,0.16)",
            borderBottom: "1px solid rgba(255,255,255,0.16)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.35), 0 14px 30px -18px rgba(0,0,0,0.6)",
          }}
        >
          {/* Banner Skeleton */}
          <div className="relative h-48 sm:h-44 bg-gradient-to-r from-[#1e2a4d] via-[#2a3d6b] to-[#1e2a4d] animate-pulse">
            <div className="absolute -bottom-6 left-2 sm:left-3 md:left-6 size-32 sm:size-36 md:size-40 rounded-2xl bg-gradient-to-br from-[#2a3d6b] to-[#1e2a4d] border-2 border-white/20 animate-pulse" style={{
              boxShadow: "0 14px 28px -16px rgba(0,0,0,0.65)",
            }} />
          </div>

          {/* Content Skeleton */}
          <div
            className="relative z-10 px-4 pt-6 pb-3"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in oklab, #0f214a 60%, #0a1634 40%), color-mix(in oklab, #112956 70%, #0b1736 30%))",
              borderTop: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                {/* Name Skeleton */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-48 bg-white/10 rounded-md animate-pulse" />
                  <div className="h-5 w-7 bg-white/10 rounded animate-pulse" />
                </div>
                {/* Location Skeleton */}
                <div className="mt-2 flex items-start gap-2 mb-3">
                  <div className="h-5 w-5 bg-white/10 rounded-full animate-pulse mt-0.5" />
                  <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
                </div>
                {/* Job Title Skeleton */}
                <div className="h-8 w-36 bg-white/10 rounded-md animate-pulse" />
              </div>
              {/* Buttons Skeleton */}
              <div className="ml-3 shrink-0 grid gap-2 text-sm">
                <div className="hidden sm:grid gap-2">
                  <div className="h-9 w-28 bg-white/10 rounded-md animate-pulse" />
                  <div className="h-9 w-32 bg-white/10 rounded-md animate-pulse" />
                </div>
                <div className="flex flex-col items-center gap-2 sm:hidden">
                  <div className="h-10 w-10 bg-white/10 rounded-full animate-pulse" />
                  <div className="h-10 w-10 bg-white/10 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // TypeScript now knows heroData is not null after the check above
  const data = heroData;

  return (
    <>
      <Card borderless className="col-span-full lg:col-span-7 xl:col-span-8 relative">
        {/* Edit Button */}
        <button
          onClick={() => setShowEditModal(true)}
          className="absolute top-2 right-2 z-30 p-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-lg transition-colors"
          title="Edit Hero Section"
          aria-label="Edit Hero Section"
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div
          className="relative overflow-hidden rounded-tl-xl rounded-tr-none rounded-br-xl rounded-bl-xl"
          style={{
            background: "transparent",
            borderTop: "1px solid rgba(255,255,255,0.16)",
            borderLeft: "1px solid rgba(255,255,255,0.16)",
            borderBottom: "1px solid rgba(255,255,255,0.16)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.35), 0 14px 30px -18px rgba(0,0,0,0.6)",
          }}
        >
          <div className="relative h-48 sm:h-44">
            <Image src={data.bannerImage} alt="Banner background" fill className="object-cover object-right sm:object-center" priority />
            <button
              ref={avatarRef}
              onClick={openReveal}
              aria-label="Reveal Profile"
              className={`absolute -bottom-6 left-2 sm:left-3 md:left-6 size-32 sm:size-36 md:size-40 rounded-2xl overflow-hidden border rotate-2 z-20 focus:outline-none focus:ring-2 focus:ring-yellow-400 cr-glass-hover ${!hasRevealed ? 'cr-tempt-bob cr-tempt-glow cr-tempt-shimmer' : ''}`}
              style={{
                borderColor: "color-mix(in oklab, var(--accent) 45%, white 8%)",
                borderWidth: 2,
                boxShadow: "0 0 0 2px color-mix(in oklab, var(--cr-blue) 40%, #0a1634 60%), 0 14px 28px -16px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              {!hasRevealed && (
                <div aria-hidden className="pointer-events-none absolute -inset-1 cr-tempt-ping" />
              )}
              {hasRevealed ? (
                <Image src={data.profilePhoto} alt="Profile photo" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0">
                  <div className="absolute inset-0 grid place-items-center" style={{
                    background: "linear-gradient(180deg, #a855f7 10%, #7c3aed 55%, #6d28d9 100%)",
                    boxShadow: "inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 0 rgba(0,0,0,0.45)",
                  }}>
                    <span className="clash-font text-white text-4xl sm:text-5xl font-extrabold" style={{ textShadow: "0 2px 0 rgba(0,0,0,0.35)" }}>?</span>
                  </div>
                  <div aria-hidden className="pointer-events-none absolute -inset-0.5 rounded-2xl" style={{
                    boxShadow: "0 0 0 2px rgba(255,255,255,0.2), 0 10px 24px -14px rgba(0,0,0,0.6)",
                  }} />
                  <div aria-hidden className="pointer-events-none absolute -inset-2 cr-rayfield cr-ray-pulse" style={{ opacity: 0.7 }} />
                  <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl" style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 18%, rgba(255,255,255,0.02) 35%, transparent 50%)",
                    mixBlendMode: "screen",
                  }} />
                </div>
              )}
            </button>
          </div>

          <div
            className="relative z-10 px-4 pt-6 pb-3"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in oklab, #0f214a 60%, #0a1634 40%), color-mix(in oklab, #112956 70%, #0b1736 30%))",
              borderTop: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1
                    className="truncate text-2xl sm:text-3xl font-extrabold tracking-tight"
                    style={{ textShadow: "0 2px 0 rgba(0,0,0,0.45)" }}
                  >
                    {data.name}
                  </h1>
                  <Image src="/cr-crown.svg" alt="Crown" width={28} height={18} className="-translate-y-1" />
                </div>
                <div className="mt-2 flex items-start gap-2 text-white/85 text-xs sm:text-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.314-2.686-6-6-6zm0 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor"/>
                  </svg>
                  <span className="">{data.location}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {data.jobTitle.split(",").map((title) => title.trim()).filter(Boolean).map((title, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center rounded-md px-2.5 py-1.5 text-white/90 text-xs sm:text-sm font-semibold"
                      style={{
                        border: "1px solid color-mix(in oklab, var(--cr-blue) 22%, white 10%)",
                        background:
                          "linear-gradient(180deg, color-mix(in oklab, var(--cr-blue) 20%, transparent), color-mix(in oklab, var(--cr-navy) 65%, #0b1736 35%))",
                      }}
                    >
                      {title}
                    </div>
                  ))}
                </div>
              </div>
              <div className="ml-3 shrink-0 grid gap-2 text-sm">
                <div className="flex flex-col items-center gap-2 sm:hidden">
                 <a
                  href={data.resumes?.[0]?.url || data.resumeUrl || "#"}
                  onClick={openResume}
                  aria-label="Open resume"
                  title="Resume"
                  target="_blank"
                  rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full active:translate-y-0.5 transition shadow-md cr-glass-hover"
                    style={{
                      width: 40,
                      height: 40,
                      border: "1px solid color-mix(in oklab, var(--accent) 55%, #8f6a12 45%)",
                      background:
                        "linear-gradient(180deg, color-mix(in oklab, var(--accent) 92%, white 6%), color-mix(in oklab, var(--accent) 70%, #b68b1a 30%))",
                      boxShadow: "inset 0 2px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                    }}
                  >
                    <Image src="/cr-scroll.svg" alt="Resume" width={18} height={18} />
                  </a>
                <a
                  href={`mailto:${data.email}`}
                  aria-label="Send email"
                  title="Send Email"
                    className="inline-flex items-center justify-center rounded-full active:translate-y-0.5 transition shadow-md cr-glass-hover"
                    style={{
                      width: 40,
                      height: 40,
                      border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                      background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                    }}
                  >
                    <Image src="/cr-mail.svg" alt="Email" width={18} height={18} />
                  </a>
                </div>
                <div className="hidden sm:grid gap-2">
                 <a
                  href={data.resumes?.[0]?.url || data.resumeUrl || "#"}
                  onClick={openResume}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 font-extrabold active:translate-y-0.5 transition text-black cr-glass-hover"
                  target="_blank"
                  rel="noopener noreferrer"
                    style={{
                      border: "1px solid color-mix(in oklab, var(--accent) 55%, #8f6a12 45%)",
                      background:
                        "linear-gradient(180deg, color-mix(in oklab, var(--accent) 92%, white 6%), color-mix(in oklab, var(--accent) 70%, #b68b1a 30%))",
                      boxShadow: "inset 0 2px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                    }}
                  >
                    <Image
                      src="/cr-scroll.svg"
                      alt="Resume"
                      width={20}
                      height={20}
                      className="block"
                      style={{ filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.4))" }}
                    />
                    <span>Resume</span>
                  </a>
                <a
                  href={`mailto:${data.email}`}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 font-semibold text-white active:translate-y-0.5 transition cr-glass-hover"
                    style={{
                      border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
                      background:
                        "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                    }}
                  >
                    <Image
                      src="/cr-mail.svg"
                      alt="Email"
                      width={20}
                      height={20}
                      className="block"
                      style={{ filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.5))" }}
                    />
                    <span>Send Email</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[200] grid place-items-center p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="Edit Hero Section">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />
          <div className="relative z-[201] w-full max-w-[96vw] sm:max-w-[900px] lg:max-w-[1000px] rounded-[16px] sm:rounded-[24px] overflow-hidden max-h-[95vh] overflow-y-auto" style={{
            background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
            transform: `scale(${editScale})`,
            transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
          }}>
            <div className="relative flex items-center px-3 py-3 sm:px-6 sm:py-6" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            }}>
              <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide text-[10px] sm:text-sm px-2 text-center max-w-[calc(100%-80px)] truncate" style={{
                textTransform: "uppercase",
                textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45), -1px -1px 0 #1c2744, 1px -1px 0 #1c2744, -1px 1px 0 #1c2744, 1px 1px 0 #1c2744",
                letterSpacing: 1,
              }}>Edit Hero Section</div>
              <button
                type="button"
                onClick={handleCancel}
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
                <div className="space-y-4">
                  {/* Banner Image Upload - Top most, matching Hero layout */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#233457] mb-1.5">
                      Banner Background Image
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect("banner", e.target.files?.[0] || null)}
                        className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#5ea0ff] file:text-white hover:file:bg-[#2f66d0] file:cursor-pointer"
                        disabled={uploading.banner}
                      />
                      {selectedFiles.banner && (
                        <div className="space-y-1">
                          <div className="text-xs text-[#233457]/70">
                            Selected: {selectedFiles.banner.name} ({(selectedFiles.banner.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                          <BannerPreview file={selectedFiles.banner} />
                        </div>
                      )}
                      {heroData.bannerImage && !selectedFiles.banner && (
                        <div className="space-y-1">
                          <div className="text-xs text-[#233457]/70">Current banner:</div>
                          <div className="relative w-full h-32 rounded-md overflow-hidden border border-[#233457]/20">
                            <Image
                              src={heroData.bannerImage}
                              alt="Current banner"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}
                      {uploading.banner && (
                        <div className="w-full bg-[#233457]/10 rounded-md h-2 overflow-hidden">
                          <div
                            className="h-full bg-[#5ea0ff] transition-all duration-300"
                            style={{ width: `${uploadProgress.banner}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#233457]/60 mt-1">Upload an image file (max 10MB)</p>
                  </div>

                  {/* Profile Photo Upload - Second, matching Hero layout */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#233457] mb-1.5">
                      Profile Photo
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect("profile", e.target.files?.[0] || null)}
                        className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#5ea0ff] file:text-white hover:file:bg-[#2f66d0] file:cursor-pointer"
                        disabled={uploading.profile}
                      />
                      {selectedFiles.profile && (
                        <div className="space-y-1">
                          <div className="text-xs text-[#233457]/70">
                            Selected: {selectedFiles.profile.name} ({(selectedFiles.profile.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                          <ProfilePreview file={selectedFiles.profile} />
                        </div>
                      )}
                      {heroData.profilePhoto && !selectedFiles.profile && (
                        <div className="space-y-1">
                          <div className="text-xs text-[#233457]/70">Current profile:</div>
                          <div className="relative w-32 h-32 rounded-md overflow-hidden border border-[#233457]/20">
                            <Image
                              src={heroData.profilePhoto}
                              alt="Current profile"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}
                      {uploading.profile && (
                        <div className="w-full bg-[#233457]/10 rounded-md h-2 overflow-hidden">
                          <div
                            className="h-full bg-[#5ea0ff] transition-all duration-300"
                            style={{ width: `${uploadProgress.profile}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#233457]/60 mt-1">Upload an image file (max 10MB)</p>
                  </div>

                  {/* Name Field - Third, matching Hero layout */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#233457] mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>

                  {/* Location and Job Title Row - Matching Hero layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Location Field */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-[#233457] mb-1.5">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                        placeholder="Enter your location"
                      />
                    </div>

                    {/* Job Title Field */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-[#233457] mb-1.5">
                        Job Title(s)
                      </label>
                      <input
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        className="w-full px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm text-[#233457] bg-white border border-[#233457]/20 focus:outline-none focus:ring-2 focus:ring-[#5ea0ff] focus:border-transparent"
                        placeholder="e.g. Full Stack Developer, Social Media Manager"
                      />
                      <p className="text-[10px] text-[#233457]/60 mt-1">Separate multiple titles with commas to show them as individual badges.</p>
                    </div>
                  </div>

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

                  {/* Standalone resume upload removed. All resumes are now managed in the Tailored Resumes list below. */}

                  {/* Tailored Resumes Section */}
                  <div className="border-t border-[#233457]/15 pt-4 mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs sm:text-sm font-semibold text-[#233457]">
                        Tailored Resumes (Optional)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddTailoredResume}
                        className="inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-white active:translate-y-0.5 transition cr-glass-hover cursor-pointer"
                        style={{
                          border: "1px solid color-mix(in oklab, #10b981 35%, white 10%)",
                          background: "linear-gradient(180deg, #10b981 0%, #059669 60%, #047857 100%)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <span>Add Version</span>
                      </button>
                    </div>
                    
                    <div className="space-y-3.5">
                      {(formData.resumes || []).map((resume, idx) => (
                        <div key={idx} className="p-3 rounded-lg border border-[#233457]/15 bg-white/40 relative animate-in fade-in slide-in-from-top-1 duration-150">
                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveTailoredResume(idx)}
                            className="absolute top-2 right-2 p-1.5 rounded-md text-white hover:bg-red-600 transition-colors z-10 cursor-pointer"
                            style={{
                              background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 55%, #b73838 100%)",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                            }}
                            title="Remove resume version"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                          
                          {/* Label field */}
                          <div className="mb-2.5">
                            <label className="block text-[11px] font-semibold text-[#233457] mb-1">
                              Resume Label / Specialty
                            </label>
                            <input
                              type="text"
                              value={resume.label}
                              onChange={(e) => handleTailoredResumeLabelChange(idx, e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded text-xs text-[#233457] bg-white border border-[#233457]/15 focus:outline-none focus:ring-1 focus:ring-[#5ea0ff]"
                              placeholder="e.g. Social Media Marketing"
                            />
                          </div>
                          
                          {/* File field */}
                          <div>
                            <label className="block text-[11px] font-semibold text-[#233457] mb-1">
                              PDF File
                            </label>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => handleTailoredResumeFileSelect(idx, e.target.files?.[0] || null)}
                              className="w-full text-xs text-[#233457] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-[#5ea0ff] file:text-white hover:file:bg-[#2f66d0]"
                            />
                            {selectedTailoredFiles[idx] && (
                              <div className="text-[10px] text-[#233457]/70 mt-1">
                                Selected: {selectedTailoredFiles[idx].name} ({(selectedTailoredFiles[idx].size / 1024 / 1024).toFixed(2)} MB)
                              </div>
                            )}
                            {resume.url && !selectedTailoredFiles[idx] && (
                              <div className="text-[10px] text-[#233457]/70 mt-1">
                                Current: <a href={resume.url} target="_blank" rel="noopener noreferrer" className="text-[#5ea0ff] hover:underline">View PDF</a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {(!formData.resumes || formData.resumes.length === 0) && (
                        <div className="text-center text-xs text-[#233457]/60 italic py-2">
                          No tailored resume versions added yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={uploading.banner || uploading.profile}
                      className="inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-xs sm:text-sm font-semibold text-white active:translate-y-0.5 transition cr-glass-hover flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-xs sm:text-sm font-semibold text-white active:translate-y-0.5 transition cr-glass-hover flex-1"
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
        </div>
      )}

      {/* Profile Reveal Modal - Same as original */}
      {showReveal && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center"
          onClick={closeReveal}
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 backdrop-blur-sm" style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, rgba(17,24,39,0.8), rgba(2,6,23,0.9))",
          }} />
          <div ref={wrapperRef} className="relative z-[101] cr-perspective" onClick={(e) => e.stopPropagation()}>
            {isCentered && (
              <>
                <div aria-hidden className="absolute -inset-10 cr-aurora" style={{ zIndex: 0 }} />
                <div aria-hidden className="absolute -inset-2 cr-ring" style={{ zIndex: 1 }} />
                <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
                  <div className="cr-mote absolute left-[8%] top-[18%]" />
                  <div className="cr-mote absolute right-[10%] bottom-[14%]" style={{ animationDelay: "400ms" }} />
                  <div className="cr-mote absolute left-[22%] bottom-[28%]" style={{ animationDelay: "900ms" }} />
                </div>
              </>
            )}
            <div
              ref={cardRef}
              className="cr-legend-reveal cr-reveal-card cr-reveal-glow mx-auto overflow-hidden rounded-2xl border z-10"
              style={{
                width: 280,
                height: 360,
                ...(revealVars
                  ? ({
                      ["--cr-reveal-x"]: `${revealVars.x}px`,
                      ["--cr-reveal-y"]: `${revealVars.y}px`,
                      ["--cr-reveal-scale"]: `${revealVars.scale}`,
                      ["--cr-reveal-rot"]: `${revealVars.rot}deg`,
                    } as unknown as React.CSSProperties)
                  : {}),
                borderColor: "#000",
                boxShadow:
                  "0 0 0 3px #000, 0 0 0 8px #1a1d2a, inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 0 rgba(0,0,0,0.55), 0 28px 70px rgba(0,0,0,0.6)",
                background:
                  "linear-gradient(180deg, #a855f7 8%, #7c3aed 55%, #6d28d9 100%)",
              }}
            >
              <div aria-hidden className="absolute -inset-4 cr-rayfield" style={{ opacity: 0.35 }} />
              {isCentered && (
                <>
                  <div aria-hidden className="absolute -inset-1 cr-rim-glow" />
                  <div aria-hidden className="absolute -inset-4 cr-rayfield cr-ray-pulse" />
                </>
              )}
              {isCentered && revealPhase === "legend" && (
                <>
                  <div aria-hidden className="absolute inset-0 cr-edge-scan" />
                  <div aria-hidden className="cr-orbit r1"><div className="dot" /></div>
                  <div aria-hidden className="cr-orbit r2"><div className="dot" /></div>
                  <div aria-hidden className="cr-orbit r3"><div className="dot" /></div>
                </>
              )}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-1 rounded-2xl"
                style={{
                  boxShadow:
                    "inset 0 2px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.35)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 18%, rgba(255,255,255,0.02) 35%, transparent 50%)",
                  mixBlendMode: "screen",
                }}
              />
              {isCentered && (
                <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
                  <div className="cr-sparkle absolute left-[18%] top-[38%]" />
                  <div className="cr-sparkle absolute right-[14%] bottom-[22%]" style={{ animationDelay: "300ms" }} />
                </div>
              )}
              <div className={`absolute inset-0 grid place-items-center transition-opacity duration-500 ${revealPhase === "legend" ? "opacity-100" : "opacity-0"}`}>
                <span
                  className="clash-font text-white text-8xl sm:text-9xl font-extrabold"
                  style={{
                    textShadow:
                      "0 3px 0 rgba(0,0,0,0.35), 0 0 12px rgba(255,255,255,0.2)",
                  }}
                >
                  ?
                </span>
              </div>
              {isCentered && (
                <div aria-hidden className="pointer-events-none absolute inset-0 cr-glare-sweep" />
              )}
              {celebrate && (
                <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
                  <div className="cr-shockwave absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span
                      key={i}
                      className="cr-confetti absolute left-1/2 top-1/2"
                      style={{
                        ["--tx"]: `${(Math.cos((i / 12) * Math.PI * 2) * (60 + (i % 3) * 18)).toFixed(0)}px`,
                        ["--ty"]: `${(Math.sin((i / 12) * Math.PI * 2) * (-70 - (i % 3) * 16)).toFixed(0)}px`,
                        background: ["#f2c94c", "#ffffff", "#b277ff"][i % 3],
                        animationDelay: `${(i % 4) * 40}ms`,
                      } as unknown as React.CSSProperties}
                    />
                  ))}
                </div>
              )}
              <div className="absolute inset-0">
                <Image
                  src={heroData.profilePhoto}
                  alt="Profile"
                  fill
                  className={`object-cover transition-opacity duration-500 ${revealPhase === "profile" ? "opacity-100" : "opacity-0"}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Resume Option Selection Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-[220] grid place-items-center p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="Select Resume">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowResumeModal(false)} />
          <div className="relative z-[221] w-full max-w-[min(94vw,400px)] rounded-[20px] overflow-hidden animate-in fade-in zoom-in-95 duration-150" style={{
            background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            boxShadow: "0 28px 60px -24px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.15)",
            transform: `scale(${resumeScale})`,
            transition: "transform 180ms cubic-bezier(.2,.9,.25,1)",
          }}>
            <div className="relative flex items-center px-4 py-4 border-b border-white/10" style={{
              background: "linear-gradient(180deg, #808a99 0%, #6b7586 100%)",
            }}>
              <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-white tracking-wide text-xs sm:text-sm text-center uppercase" style={{
                textShadow: "0 2px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.45)",
                letterSpacing: 1,
              }}>Select Resume</div>
              <button
                type="button"
                onClick={() => setShowResumeModal(false)}
                aria-label="Close"
                className="grid place-items-center z-10"
                style={{
                  position: "absolute",
                  right: 12,
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
                <span className="text-white font-extrabold text-xs" style={{ textShadow: "0 1px 0 rgba(0,0,0,0.3)", lineHeight: 1 }}>x</span>
              </button>
            </div>
            <div className="px-4 py-5 sm:px-5">
              <div className="rounded-xl p-3 sm:p-4" style={{
                background: "linear-gradient(180deg, #f5f9ff 0%, #e3ecfb 40%, #cfdbf1 100%)",
                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
              }}>
                <div className="space-y-2.5">
                  {heroData.resumes?.map((resume, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        window.open(resume.url, "_blank");
                        setShowResumeModal(false);
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-lg text-left transition-all border cr-glass-hover cursor-pointer"
                      style={{
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "linear-gradient(180deg, #ffffff 0%, #f3f7ff 100%)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.04), inset 0 1px 0 #fff",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-[#5ea0ff]/10 text-[#2f66d0]">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-extrabold text-[#233457]">{resume.label}</div>
                          <div className="text-[10px] text-[#233457]/60 mt-0.5">Click to view or download PDF</div>
                        </div>
                      </div>
                      <div className="text-[#2f66d0]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    </button>
                  ))}
                  {/* Fallback default button removed to only show tailored resumes in this list */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


