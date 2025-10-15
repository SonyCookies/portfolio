import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume",
};

export default function ResumePage() {
  return (
    <main style={{ height: "100vh", display: "grid", gridTemplateRows: "1fr" }}>
      <iframe
        src="/files/Sarcia_Resume.pdf"
        title="Resume PDF"
        style={{ width: "100%", height: "100%", border: 0 }}
      />
      {/* Fallback link if the PDF cannot be embedded */}
      <noscript>
        <p>
          PDF viewer requires JavaScript. <a href="/files/Sarcia_Resume.pdf" target="_blank" rel="noreferrer">Open Resume</a>
        </p>
      </noscript>
    </main>
  );
}
