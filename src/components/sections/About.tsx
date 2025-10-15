import Card from "@/components/ui/Card";

export default function About() {
  return (
    <Card
      title={
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 6.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" fill="currentColor"/>
            <path d="M6 18.5c0-3.314 2.686-6 6-6s6 2.686 6 6" fill="currentColor" opacity=".85"/>
          </svg>
          <span>About</span>
        </>
      }
      className="col-span-full lg:col-span-7 xl:col-span-8"
    >
      {/* glossy section */}
      <div
        className="rounded-xl p-3 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-2 right-2 top-1 h-1.5 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.02))",
          }}
        />

        <p className="text-white/85 leading-relaxed">
          Full-Stack Software Engineer with expertise in Next.js, Python, and FastAPI, specializing in building end-to-end web applications, automation tools, and system integrations. Known for delivering efficient, scalable solutions by combining strong problem-solving skills with a practical, engineering-driven mindset. Experienced in both frontend and backend development, I design systems that optimize processes, improve performance, and support business growth. Also I&apos;m a heavy Clash Royale gamer.

        </p>
      </div>

    </Card>
  );
}
