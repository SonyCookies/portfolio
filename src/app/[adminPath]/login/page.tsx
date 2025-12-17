"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const adminPath = params?.adminPath as string;
    
    if (!adminPath) {
      return;
    }
    
    let isMounted = true;
    
    // Verify the admin path in the background (non-blocking)
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
      .catch(() => {
        // On error, just continue - don't block the user
        console.error("Path verification failed");
      });

    // Check auth state in background (middleware handles redirects, this is just a backup)
    // Use a delay to ensure UI renders first
    const checkAuth = setTimeout(() => {
      if (!isMounted || !auth) return;
      
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!isMounted) return;
        
        if (user) {
          // Check if user has valid session before redirecting
          fetch("/api/admin/check")
            .then((res) => res.json())
            .then((data) => {
              if (data.authenticated && isMounted) {
                router.push(`/${adminPath}`);
              }
            })
            .catch(() => {
              // Stay on login page if check fails
            });
        }
        
        // Clean up after first check
        unsubscribe();
      });
    }, 500); // Delay to let UI render first

    return () => {
      isMounted = false;
      clearTimeout(checkAuth);
    };
  }, [router, params?.adminPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!auth) {
        setError("Firebase is not configured. Please check your environment variables.");
        setLoading(false);
        return;
      }

      if (!auth) {
        setError("Firebase authentication is not available");
        return;
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // Send token to backend to create session
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (response.ok) {
        // Get the admin path from params
        const adminPath = params?.adminPath as string;
        router.push(`/${adminPath}`);
        router.refresh();
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: "linear-gradient(180deg, #0f214a 0%, #0a1634 100%)",
    }}>
      <div className="w-full max-w-md p-8 rounded-2xl" style={{
        background: "linear-gradient(180deg, #1e2a4d 0%, #0f1a3a 60%, #0b1530 100%)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 10px 18px -12px rgba(0,0,0,0.6)",
      }}>
        <h1 className="text-2xl font-extrabold text-white mb-6 text-center" style={{
          textShadow: "0 2px 0 rgba(0,0,0,0.45)",
        }}>
          Admin Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-white placeholder-white/50"
              style={{
                background: "linear-gradient(180deg, #2a3d6b 0%, #1a2a4d 100%)",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
              placeholder="Enter your email"
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-white/90 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-white placeholder-white/50"
              style={{
                background: "linear-gradient(180deg, #2a3d6b 0%, #1a2a4d 100%)",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
              placeholder="Enter your password"
              required
            />
          </div>
          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-extrabold text-black active:translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(180deg, #ffd052 0%, #f7b52d 70%, #d98f12 100%)",
              border: "1px solid #b17a15",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.8), 0 10px 20px -10px rgba(0,0,0,0.35)",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
