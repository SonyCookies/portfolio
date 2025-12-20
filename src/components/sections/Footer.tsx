"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getFooterData, type FooterData } from "@/lib/footer-data";
import { getViewCount } from "@/lib/view-count";

export default function Footer() {
  const router = useRouter();
  const year = new Date().getFullYear();
  const [footerData, setFooterData] = useState<FooterData>({
    copyrightName: "Sonny Sarcia",
    techStack: "Coded from scratch using Next.js and Tailwind CSS.",
    credits: "Layout inspiration from Bryl Lim. Design heavily influenced by Clash Royale.",
  });
  const [loading, setLoading] = useState(true);
  const [viewCount, setViewCount] = useState<number | null>(null);
  
  // Admin path - should match the ADMIN_PATH env variable or default
  // Using NEXT_PUBLIC_ prefix so it's available on the client side
  const ADMIN_PATH = (typeof window !== 'undefined' && (window as any).__ADMIN_PATH__) 
    || process.env.NEXT_PUBLIC_ADMIN_PATH 
    || 'a8f3k2j9x7m1n5p';
  
  const handleAdminClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    router.push(`/${ADMIN_PATH}`);
  };

  // Load footer data from Firestore
  useEffect(() => {
    const loadFooterData = async () => {
      try {
        setLoading(true);
        const data = await getFooterData();
        setFooterData(data);
      } catch (error) {
        console.error("[Footer] Error loading footer data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadFooterData();
  }, []);

  // Load view count from Firestore
  useEffect(() => {
    const loadViewCount = async () => {
      try {
        const count = await getViewCount();
        setViewCount(count);
      } catch (error) {
        console.error("[Footer] Error loading view count:", error);
      }
    };
    loadViewCount();
  }, []);

  // Parse tech stack to extract technology names for styling
  const parseTechStack = (text: string): ReactNode => {
    const techNames = ["Next.js", "Tailwind CSS", "React", "TypeScript", "Python", "FastAPI"];
    const parts: (string | ReactNode)[] = [];
    let lastIndex = 0;
    let key = 0;

    techNames.forEach(tech => {
      const regex = new RegExp(`(${tech})`, "gi");
      const match = regex.exec(text);
      if (match && match.index !== undefined) {
        // Add text before match
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        // Add styled tech name
        parts.push(
          <span key={key++} className="font-semibold text-white">
            {match[1]}
          </span>
        );
        lastIndex = match.index + match[0].length;
      }
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <footer className="col-span-full">
      <div className="h-px w-full" style={{
        background: "linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
      }} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 items-start">
        <div className="text-xs sm:text-sm text-white/80">
          © {year} <span className="font-semibold text-white">{footerData.copyrightName}</span>.{" "}
          <span 
            onClick={handleAdminClick}
            className="cursor-pointer hover:text-white transition-colors"
            title="Admin Access"
          >
            All
          </span>{" "}
          rights reserved.
        </div>
        <div className="text-right text-xs sm:text-sm">
          <div className="text-white/85">{parseTechStack(footerData.techStack)}</div>
          <div className="text-white/60 text-[10px] sm:text-xs">{footerData.credits}</div>
          {viewCount !== null && (
            <div className="text-white/50 text-[9px] sm:text-[10px] mt-1">
              {viewCount.toLocaleString()} {viewCount === 1 ? 'visit' : 'visits'}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
