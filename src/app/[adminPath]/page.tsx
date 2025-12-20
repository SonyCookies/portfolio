"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import HeroAdmin from "@/components/admin/sections/HeroAdmin";
import AboutTechColumnAdmin from "@/components/admin/containers/AboutTechColumnAdmin";
import ExperienceAdmin from "@/components/admin/sections/ExperienceAdmin";
import ProjectsAdmin from "@/components/admin/sections/ProjectsAdmin";
import BeyondCodingAdmin from "@/components/admin/sections/BeyondCodingAdmin";
import CertificationsAdmin from "@/components/admin/sections/CertificationsAdmin";
import TestimonialsAdmin from "@/components/admin/sections/TestimonialsAdmin";
import NetworkAdmin from "@/components/admin/sections/NetworkAdmin";
import FooterAdmin from "@/components/admin/sections/FooterAdmin";
import RightColumnAdmin from "@/components/admin/containers/RightColumnAdmin";

export default function AdminDashboard() {
  const router = useRouter();
  const params = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const adminPath = params?.adminPath as string;
    
    if (!adminPath) {
      setIsChecking(false);
      return;
    }
    
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;
    
    // Verify the admin path in the background (non-blocking, fire-and-forget)
    // This is just a double-check - middleware already handled it
    fetch("/api/admin/verify-path", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: adminPath }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        
        if (!data.valid) {
          // Invalid path, redirect to home
          router.push("/");
        }
      })
      .catch((error) => {
        // Silently fail - don't block user experience
        console.error("Path verification error:", error);
      });
    
    // Check Firebase auth state
    if (!auth) {
      router.push(`/${adminPath}/login`);
      setIsChecking(false);
      return;
    }
    
    unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      
      if (user) {
        // Verify with backend
        try {
          const response = await fetch("/api/admin/check");
          const data = await response.json();
          
          if (!data.authenticated) {
            // Not authorized, sign out
            if (auth) {
              await signOut(auth);
            }
            router.push(`/${adminPath}/login`);
            setIsChecking(false);
          } else {
            // Authenticated and authorized
            setIsAuthenticated(true);
            setIsChecking(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          // On error, redirect to login
          router.push(`/${adminPath}/login`);
          setIsChecking(false);
        }
      } else {
        // No user - redirect to login immediately
        router.push(`/${adminPath}/login`);
        setIsChecking(false);
      }
    });
      
    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [router, params?.adminPath]);

  // Show loading screen while checking authentication
  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: "linear-gradient(180deg, #0f214a 0%, #0a1634 100%)",
      }}>
        <div className="text-white/80 text-sm">Verifying authentication...</div>
      </div>
    );
  }

  return (
    <>
      {/* Portfolio Layout - Identical to Original */}
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <HeroAdmin />
          <RightColumnAdmin />
          <ExperienceAdmin />
          <AboutTechColumnAdmin />
          <ProjectsAdmin />
          <BeyondCodingAdmin />
          <CertificationsAdmin />
          <TestimonialsAdmin />
          <NetworkAdmin />
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
