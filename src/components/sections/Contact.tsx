export default function Contact() {
  return (
    <div className="mt-4">
      <div
        className="relative block rounded-2xl active:translate-y-0.5 transition"
        style={{
          padding: 0,
          filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.45))",
        }}
      >
        {/* Yellow slab background */}
        <div
          className="rounded-2xl relative overflow-hidden"
          style={{
            border: "1px solid color-mix(in oklab, var(--accent) 55%, #8f6a12 45%)",
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--accent) 92%, white 6%), color-mix(in oklab, var(--accent) 70%, #b68b1a 30%))",
            boxShadow:
              "inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 0 rgba(0,0,0,0.45), inset 0 0 0 1px rgba(0,0,0,0.06)",
            padding: 10,
          }}
        >
          {/* subtle specular highlight strip */}
          <div
            className="pointer-events-none absolute left-2 right-2 top-1 rounded-full"
            style={{
              height: 6,
              background: "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.05))",
              filter: "blur(0.2px)",
            }}
          />
          {/* Header */}
          <div className="px-2 py-1 rounded-lg text-black font-extrabold"
            style={{
              background: "linear-gradient(180deg, rgba(255,223,128,0.5), rgba(255,198,64,0.35))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
            }}
          >
            Contact
          </div>
          {/* Details */}
          <div className="mt-2 grid gap-3">
            <div>
              <a
                href="mailto:sonnypsarcia@gmail.com"
                className="group mt-1 inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-black font-extrabold hover:brightness-[1.06]"
                style={{
                  border: "1px solid rgba(0,0,0,0.2)",
                  background: "linear-gradient(180deg, #ffd74f, #e7b21a)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -2px 0 rgba(0,0,0,0.3), 0 6px 10px -10px rgba(0,0,0,0.6)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Zm2.2-.25 6.34 4.53c.29.21.68.21.97 0L18.86 6.5H5.2Z" fill="#0b1530"/>
                </svg>
                <span>sonnypsarcia@gmail.com</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="ml-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  <path d="M9 5h10v10h-2V9.41l-9.3 9.3-1.4-1.42 9.3-9.3H9V5Z" fill="#0b1530"/>
                </svg>
              </a>
            </div>
            <div>
              <a
                href="tel:+639266301717"
                className="group mt-1 inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-black font-extrabold hover:brightness-[1.06]"
                style={{
                  border: "1px solid rgba(0,0,0,0.2)",
                  background: "linear-gradient(180deg, #ffd74f, #e7b21a)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -2px 0 rgba(0,0,0,0.3), 0 6px 10px -10px rgba(0,0,0,0.6)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l1.98-1.98a1 1 0 0 1 1.03-.24c1.12.37 2.33.57 3.58.57.55 0 1 .45 1 1V20a1 1 0 0 1-1 1C10.85 21 3 13.15 3 3a1 1 0 0 1 1-1h2.27c.55 0 1 .45 1 1 0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.03l-1.98 1.98Z" fill="#0b1530"/>
                </svg>
                <span>+63-9266-301-717</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="ml-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  <path d="M9 5h10v10h-2V9.41l-9.3 9.3-1.4-1.42 9.3-9.3H9V5Z" fill="#0b1530"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Social links */}
      <div className="mt-3">
        <div className="text-white/80 text-sm mb-2">Social Links</div>
        <div className="flex items-center gap-3">
          <a
            href="https://www.linkedin.com/"
            target="_blank"
            aria-label="LinkedIn"
            className="inline-flex items-center justify-center rounded-lg active:translate-y-0.5 transition cr-glass-hover"
            style={{
              width: 48,
              height: 48,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "linear-gradient(180deg, #18223f 0%, #0f1a34 60%, #0b142b 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 8px 16px -12px rgba(0,0,0,0.6)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path fill="white" d="M6.94 8.5H4.25V20h2.69V8.5ZM5.6 7.22A1.6 1.6 0 1 0 5.6 4a1.6 1.6 0 0 0 0 3.22Zm5.87 5.05c0-.76.62-1.37 1.38-1.37.9 0 1.37.61 1.37 1.73V20h2.68v-6.43c0-2.57-1.37-3.77-3.2-3.77-1.48 0-2.15.81-2.52 1.37v-1.2h-2.6V20h2.6v-7.73Z"/>
            </svg>
          </a>
          <a
            href="https://github.com/"
            target="_blank"
            aria-label="GitHub"
            className="inline-flex items-center justify-center rounded-lg active:translate-y-0.5 transition cr-glass-hover"
            style={{
              width: 48,
              height: 48,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "linear-gradient(180deg, #18223f 0%, #0f1a34 60%, #0b142b 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 8px 16px -12px rgba(0,0,0,0.6)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path fill="white" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48 0-.23 0-.84 0-1.64-2.78.61-3.37-1.34-3.37-1.34-.46-1.17-1.12-1.48-1.12-1.48-.91-.62.07-.6.07-.6 1 .07 1.52 1.03 1.52 1.03.9 1.52 2.37 1.08 2.94.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.26.1-2.63 0 0 .85-.27 2.77 1.02A9.6 9.6 0 0 1 12 6.8a9.6 9.6 0 0 1 2.52.34c1.92-1.29 2.77-1.02 2.77-1.02.55 1.37.2 2.38.1 2.63.64.7 1.02 1.58 1.02 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.67.92.67 1.86 0 1.35 0 2.44 0 2.77 0 .26.18.57.69.48A10 10 0 0 0 12 2Z"/>
            </svg>
          </a>
          <a
            href="https://facebook.com/"
            target="_blank"
            aria-label="Facebook"
            className="inline-flex items-center justify-center rounded-lg active:translate-y-0.5 transition cr-glass-hover"
            style={{
              width: 48,
              height: 48,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "linear-gradient(180deg, #18223f 0%, #0f1a34 60%, #0b142b 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 8px 16px -12px rgba(0,0,0,0.6)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path fill="white" d="M13.5 20v-6h2.02l.31-2.33H13.5V9.62c0-.67.19-1.13 1.15-1.13h1.24V6.37c-.22-.03-.98-.09-1.86-.09-1.84 0-3.1 1.12-3.1 3.17v1.77H8.9V14h1.93v6h2.67Z"/>
            </svg>
          </a>
          <a
            href="https://instagram.com/"
            target="_blank"
            aria-label="Instagram"
            className="inline-flex items-center justify-center rounded-lg active:translate-y-0.5 transition cr-glass-hover"
            style={{
              width: 48,
              height: 48,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "linear-gradient(180deg, #18223f 0%, #0f1a34 60%, #0b142b 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45), 0 8px 16px -12px rgba(0,0,0,0.6)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path fill="white" d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5.2A4.8 4.8 0 1 0 16.8 13 4.81 4.81 0 0 0 12 8.2Zm0 7.6A2.8 2.8 0 1 1 14.8 13 2.8 2.8 0 0 1 12 15.8Zm5.85-9.9a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3Z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
