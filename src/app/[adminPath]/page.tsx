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
import RightColumnAdmin from "@/components/containers/RightColumnAdmin";

export default function AdminDashboard() {
  const router = useRouter();
  const params = useParams();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const adminPath = params?.adminPath as string;
    
    if (!adminPath) {
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
    unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      
      if (user) {
        // Verify with backend
        try {
          const response = await fetch("/api/admin/check");
          const data = await response.json();
          
          if (data.authenticated) {
            setUserEmail(user.email);
          } else {
            // Not authorized, sign out
            await signOut(auth);
            router.push(`/${adminPath}/login`);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          // On error, redirect to login
          router.push(`/${adminPath}/login`);
        }
      } else {
        // No user - redirect to login immediately
        router.push(`/${adminPath}/login`);
      }
    });
      
    return () => {
      isMounted = false;
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

  return (
    <>
      {/* Portfolio Layout - Identical to Original */}
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <HeroAdmin />
          <RightColumnAdmin />
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
