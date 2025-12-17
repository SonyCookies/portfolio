"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import HeroAdmin from "@/components/sections/HeroAdmin";
import AboutTechColumn from "@/components/containers/AboutTechColumn";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import BeyondCoding from "@/components/sections/BeyondCoding";
import Certifications from "@/components/sections/Certifications";
import Testimonials from "@/components/sections/Testimonials";
import Network from "@/components/sections/Network";
import Footer from "@/components/sections/Footer";
import RightColumn from "@/components/containers/RightColumn";

export default function AdminDashboard() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [pathValid, setPathValid] = useState(true); // Start as true - middleware already validated
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const adminPath = params?.adminPath as string;
    
    if (!adminPath) {
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;
    let loadingTimeout: NodeJS.Timeout | null = null;
    
    // Set path as valid immediately - don't block on verification
    // Middleware already validated the path, so we can trust it
    setPathValid(true);
    
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
    
    // Set a timeout to prevent infinite loading (just for logging, not blocking)
    loadingTimeout = setTimeout(() => {
      if (isMounted) {
        // Just log if auth is taking a while - don't block
        console.warn("Auth check taking longer than expected");
      }
    }, 2000);
    
    // Check Firebase auth state - this is the only thing we need to wait for
    unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      
      if (user) {
        // Verify with backend
        try {
          const response = await fetch("/api/admin/check");
          const data = await response.json();
          
          if (data.authenticated) {
            setAuthenticated(true);
            setUserEmail(user.email);
            setLoading(false);
          } else {
            // Not authorized, sign out
            setLoading(false);
            await signOut(auth);
            router.push(`/${adminPath}/login`);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          // On error, redirect to login
          setLoading(false);
          router.push(`/${adminPath}/login`);
        }
      } else {
        // No user - redirect to login immediately
        setLoading(false);
        router.push(`/${adminPath}/login`);
      }
    });
      
    return () => {
      isMounted = false;
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [router, params?.adminPath]);

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      // Clear session cookie
      await fetch("/api/admin/logout", { method: "POST" });
      const adminPath = params?.adminPath as string;
      router.push(`/${adminPath}/login`);
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading || !pathValid) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: "linear-gradient(180deg, #0f214a 0%, #0a1634 100%)",
      }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <div className="text-white/80 text-sm">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    // Show loading while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: "linear-gradient(180deg, #0f214a 0%, #0a1634 100%)",
      }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <div className="text-white/80 text-sm">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Portfolio Layout - Identical to Original */}
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <HeroAdmin />
          <RightColumn />
          <Experience />
          <AboutTechColumn />
          <Projects />
          <BeyondCoding />
          <Certifications />
          <Testimonials />
          <Network />
          <Footer />
        </div>
      </div>
    </>
  );
}
