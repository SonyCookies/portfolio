"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Card from "@/components/ui/Card";
import { getTestimonialsData, saveTestimonialsData, type Testimonial } from "@/lib/testimonials-data";
import { showToast } from "@/components/ui/Toast";

function RecommendationFormContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSpidey, setIsSpidey] = useState(false);

  // Form inputs
  const [author, setAuthor] = useState("");
  const [position, setPosition] = useState("");
  const [quote, setQuote] = useState("");

  // Theme observer
  useEffect(() => {
    if (typeof document === "undefined") return;
    const checkTheme = () => {
      setIsSpidey(document.body.classList.contains("theme-spiderman"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Validate Token on Mount
  useEffect(() => {
    const validateToken = async () => {
      console.log("[recommendation] validateToken called. URL token:", token);
      if (!token) {
        console.warn("[recommendation] No token query parameter provided in URL.");
        setLoading(false);
        return;
      }

      try {
        console.log("[recommendation] Fetching testimonials data from Firestore...");
        const data = await getTestimonialsData();
        console.log("[recommendation] Loaded data successfully:", data);
        
        const activeTokens = data.inviteTokens || [];
        console.log("[recommendation] Total invite tokens in DB:", activeTokens.length, activeTokens);
        
        const match = activeTokens.find((t) => {
          const matchToken = t.token === token;
          const matchUsed = !t.used;
          console.log(`[recommendation] Checking token: "${t.token}" vs URL token: "${token}". Matches? ${matchToken}. Not used? ${matchUsed}`);
          return matchToken && matchUsed;
        });

        console.log("[recommendation] Token matching result:", match);

        if (match) {
          setIsValidToken(true);
          setRecipientName(match.recipientName || "");
          console.log("[recommendation] Token is valid! Recipient:", match.recipientName);
        } else {
          console.warn("[recommendation] No unused match found for URL token.");
        }
      } catch (error) {
        console.error("[recommendation] Error validating token:", error);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !position.trim() || !quote.trim()) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setSubmitting(true);

    try {
      const data = await getTestimonialsData();
      
      // Double check token validity
      const activeTokens = data.inviteTokens || [];
      const tokenIdx = activeTokens.findIndex((t) => t.token === token && !t.used);

      if (tokenIdx === -1) {
        showToast("This invite link has expired or is invalid.", "error");
        setIsValidToken(false);
        setSubmitting(false);
        return;
      }

      // 1. Create pending testimonial
      const newTestimony: Testimonial = {
        id: `testimonial-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        quote: quote.trim(),
        author: author.trim(),
        position: position.trim(),
        approved: false, // requires admin approval
        createdAt: Date.now(),
      };

      // 2. Mark token as used
      const updatedTokens = [...activeTokens];
      updatedTokens[tokenIdx] = {
        ...updatedTokens[tokenIdx],
        used: true,
      };

      // 3. Save both lists to database
      await saveTestimonialsData({
        testimonials: [...data.testimonials, newTestimony],
        inviteTokens: updatedTokens,
      });

      setSubmitted(true);
      showToast("Recommendation submitted successfully!", "success");
    } catch (error) {
      console.error("Submission error:", error);
      showToast("Submission failed. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-white animate-pulse">
          <div className="text-lg font-bold">Verifying invite token...</div>
          <div className="text-xs text-white/60 mt-1">Please wait a moment</div>
        </div>
      </div>
    );
  }

  if (!token || !isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="text-red-500 bg-red-500/10 p-3 rounded-full animate-bounce">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-wide">Invalid Invite</h2>
            <p className="text-white/70 text-xs sm:text-sm mt-1">
              Oops! This invitation link is invalid or has already been used. Please request a new invite link from Sonny! 🗝️
            </p>
            <a
              href="/"
              className="mt-4 px-4 py-2 text-xs font-bold rounded-lg text-black uppercase tracking-wider transition active:translate-y-0.5"
              style={{
                border: "1px solid #cfa313",
                background: "linear-gradient(180deg, #f2c94c 0%, #d9a800 100%)",
                boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.4), 0 4px 10px rgba(0,0,0,0.35)",
              }}
            >
              Back to Portfolio
            </a>
          </div>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="flex flex-col items-center gap-3 animate-in zoom-in-95 duration-300">
            <div className="text-[#10b981] bg-[#10b981]/10 p-3 rounded-full">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 5 12" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-wide">Thank You!</h2>
            <p className="text-white/70 text-xs sm:text-sm mt-1">
              Your recommendation has been submitted successfully and is pending review by Sonny. Sonny and the code-cats are dancing! 🐾🧶
            </p>
            <a
              href="/"
              className="mt-4 px-4 py-2 text-xs font-bold rounded-lg text-black uppercase tracking-wider transition active:translate-y-0.5"
              style={{
                border: "1px solid #cfa313",
                background: "linear-gradient(180deg, #f2c94c 0%, #d9a800 100%)",
                boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.4), 0 4px 10px rgba(0,0,0,0.35)",
              }}
            >
              Back to Portfolio
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <Card
        title={
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" fill="currentColor"/>
            </svg>
            <span className="font-extrabold uppercase tracking-wide">Write Recommendation</span>
          </div>
        }
        className="w-full max-w-xl p-6"
      >
        <div className="mb-4">
          <p className="text-white/70 text-xs sm:text-sm">
            Hi {recipientName || "Friend"}! Sonny has invited you to submit a recommendation or testimonial. Please fill in the details below:
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-white/80 font-bold mb-1.5">
              Your Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-white bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              placeholder="e.g., John Doe"
            />
          </div>

          {/* Job Title / Company */}
          <div>
            <label htmlFor="position" className="block text-white/80 font-bold mb-1.5">
              Your Position / Company
            </label>
            <input
              id="position"
              type="text"
              required
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-white bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              placeholder="e.g., Senior PM at Meta"
            />
          </div>

          {/* Recommendation quote */}
          <div>
            <label htmlFor="quote" className="block text-white/80 font-bold mb-1.5">
              Your Testimony / Recommendation
            </label>
            <textarea
              id="quote"
              required
              rows={5}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-white bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              placeholder="Detail your experience working with Sonny..."
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 sm:py-3.5 rounded-xl font-black uppercase tracking-wider text-black active:translate-y-0.5 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2"
            style={{
              border: isSpidey ? "1px solid #b91c1c" : "1px solid #cfa313",
              background: isSpidey 
                ? "linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)" 
                : "linear-gradient(180deg, #f2c94c 0%, #d9a800 100%)",
              boxShadow: isSpidey
                ? "inset 0 2px 0 rgba(255,255,255,0.35), 0 6px 14px rgba(239,68,68,0.25)"
                : "inset 0 2px 0 rgba(255,255,255,0.4), 0 6px 14px rgba(0,0,0,0.35)",
              color: isSpidey ? "#fff" : "#000",
            }}
          >
            {submitting ? (
              <span>Submitting Testimony...</span>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                <span>Submit Recommendation</span>
              </>
            )}
          </button>
        </form>
      </Card>
    </div>
  );
}

export default function RecommendationForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-white animate-pulse">
          <div className="text-lg font-bold">Loading...</div>
        </div>
      </div>
    }>
      <RecommendationFormContent />
    </Suspense>
  );
}
