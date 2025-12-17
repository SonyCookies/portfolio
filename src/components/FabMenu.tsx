"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const STORAGE_KEY = "fontTheme"; // 'clash' | 'default'

interface FabMenuProps {
  showLogout?: boolean;
  onLogout?: () => void;
}

export default function FabMenu({ showLogout = false, onLogout }: FabMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Check if we're on admin page (check for admin path pattern)
  // Admin path is typically a long random string (15+ chars), and not the login page
  // Only check on client to avoid hydration mismatch
  const adminPathPattern = /^\/[a-z0-9]{15,}(?!\/login)/;
  const isAdminPage = isMounted && pathname ? adminPathPattern.test(pathname) && !pathname.includes("/login") : false;
  const shouldShowLogout = showLogout || isAdminPage;

  // Initialize from localStorage (client-side only to avoid hydration errors)
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const shouldDefault = saved === "default";
      setIsDefault(shouldDefault);
      applyClass(shouldDefault);
    } catch {}
  }, []);

  const applyClass = (useDefault: boolean) => {
    if (typeof document === "undefined") return;
    const body = document.body;
    if (useDefault) {
      body.classList.add("font-default");
    } else {
      body.classList.remove("font-default");
    }
  };

  const toggleFont = () => {
    const next = !isDefault;
    setIsDefault(next);
    applyClass(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "default" : "clash");
    } catch {}
    setIsOpen(false);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    
    if (onLogout) {
      onLogout();
      return;
    }
    
    if (isAdminPage && pathname) {
      try {
        if (auth) {
          await signOut(auth);
        }
        await fetch("/api/admin/logout", { method: "POST" });
        const adminPath = pathname.split("/")[1];
        if (adminPath) {
          router.push(`/${adminPath}/login`);
          router.refresh();
        }
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen || !isMounted) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".fab-menu-container")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen, isMounted]);

  // Use default purple gradient initially to match server render
  const fontButtonBackground = isMounted && isDefault
    ? "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)"
    : "linear-gradient(180deg, #a855f7 10%, #7c3aed 55%, #6d28d9 100%)";

  return (
    <div className="fixed bottom-6 right-6 z-50 fab-menu-container">
      {/* Menu Items */}
      <div className="absolute bottom-0 right-0 flex flex-col-reverse gap-3 mb-16">
        {/* Logout Button - Always render to avoid hydration mismatch */}
        <button
          onClick={handleLogout}
          className="w-12 h-12 rounded-full shadow-lg active:translate-y-0.5 grid place-items-center"
          style={{
            background: "linear-gradient(180deg, #ff6b6b 0%, #d14949 55%, #b73838 100%)",
            border: "1px solid rgba(0,0,0,0.45)",
            boxShadow: "0 10px 20px -10px rgba(0,0,0,0.55), inset 0 2px 0 rgba(255,255,255,0.35)",
            opacity: isOpen && isMounted && shouldShowLogout ? 1 : 0,
            transform: isOpen && isMounted && shouldShowLogout 
              ? "translateY(0) translateX(0) scale(1)" 
              : "translateY(0) translateX(0) scale(0)",
            pointerEvents: isOpen && isMounted && shouldShowLogout ? "auto" : "none",
            display: shouldShowLogout ? "grid" : "none",
            transitionProperty: isMounted ? "opacity, transform" : "none",
            transitionDuration: isMounted ? "0.25s, 0.3s" : "0s",
            transitionTimingFunction: isMounted ? "cubic-bezier(0.4, 0, 0.2, 1), cubic-bezier(0.34, 1.56, 0.64, 1)" : "ease",
            transitionDelay: isOpen && isMounted && shouldShowLogout ? "0.05s, 0.05s" : "0s, 0s",
          }}
          aria-label="Logout"
          title="Logout"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>

        {/* Font Toggle Button */}
        <button
          onClick={toggleFont}
          className="w-12 h-12 rounded-full shadow-lg active:translate-y-0.5 grid place-items-center"
          style={{
            background: fontButtonBackground,
            border: "1px solid rgba(255,255,255,0.25)",
            boxShadow: "0 10px 20px -10px rgba(0,0,0,0.55), inset 0 2px 0 rgba(255,255,255,0.35)",
            opacity: isOpen && isMounted ? 1 : 0,
            transform: isOpen && isMounted 
              ? "translateY(0) translateX(0) scale(1)" 
              : "translateY(0) translateX(0) scale(0)",
            pointerEvents: isOpen && isMounted ? "auto" : "none",
            transitionProperty: isMounted ? "opacity, transform" : "none",
            transitionDuration: isMounted ? "0.25s, 0.3s" : "0s",
            transitionTimingFunction: isMounted ? "cubic-bezier(0.4, 0, 0.2, 1), cubic-bezier(0.34, 1.56, 0.64, 1)" : "ease",
            transitionDelay: isOpen && isMounted ? "0.1s, 0.1s" : "0.05s, 0.05s",
          }}
          aria-label={isMounted && isDefault ? "Switch to Clash font" : "Switch to Default font"}
          title={isMounted && isDefault ? "Use Clash font" : "Use Default font"}
        >
          <span
            className={`${isMounted && isDefault ? "font-sans" : "clash-font"} text-white text-lg font-extrabold`}
            style={{ textShadow: "0 1px 0 rgba(0,0,0,0.35)" }}
          >
            Aa
          </span>
        </button>
      </div>

      {/* Main Menu Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-14 h-14 rounded-full shadow-lg active:translate-y-0.5 transition-all grid place-items-center"
        style={{
          background: isOpen
            ? "linear-gradient(180deg, #6b7280 0%, #4b5563 60%, #374151 100%)"
            : "linear-gradient(180deg, #3b82f6 0%, #2563eb 60%, #1e40af 100%)",
          border: "1px solid rgba(255,255,255,0.25)",
          boxShadow: "0 10px 20px -10px rgba(0,0,0,0.55), inset 0 2px 0 rgba(255,255,255,0.35)",
        }}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        title={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-opacity duration-300"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-opacity duration-300"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>
    </div>
  );
}
