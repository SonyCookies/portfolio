import Card from "@/components/ui/Card";

export default function Network() {
  return (
    <Card
      title={
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm12 1h4v9h-4v-9Zm-6 2h4v7h-4v-7Z" fill="currentColor"/>
          </svg>
          <span>Connect</span>
        </>
      }
      className="col-span-full"
    >
      <div className="grid gap-4 lg:grid-cols-12">
        {/* A member of */}
        <div className="lg:col-span-3">
          <div className="mb-2 font-semibold text-white/95 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" fill="currentColor"/>
              <path d="M3 21a9 9 0 0 1 18 0H3Z" fill="currentColor" opacity=".85"/>
            </svg>
            <span>A member of</span>
          </div>
          <ul className="space-y-3">
            {[
              "Analytics & Artificial Intelligence Association of the Philippines (AAP)",
              "Philippine Software Industry Association",
            ].map((t) => (
              <li key={t} className="rounded-xl p-3" style={{
                border: "1px solid rgba(255,255,255,0.14)",
                background: "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
              }}>
                <div className="text-sm text-white/90 leading-snug">{t}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Links */}
        <div className="lg:col-span-3">
          <div className="mb-2 font-semibold text-white/95 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 5h16v14H4z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>Social Links</span>
          </div>
          <div className="grid gap-3">
            {[
              { label: "LinkedIn", href: "https://linkedin.com/", icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M4 3h4v4H4V3Zm0 6h4v12H4V9Zm6 0h4v2.5h.06A4.38 4.38 0 0 1 18 8.88C20.28 8.88 22 10.38 22 13.7V21h-4v-6.04c0-1.44-.52-2.42-1.83-2.42-1 .02-1.62.66-1.89 1.35-.1.24-.12.57-.12.9V21h-4V9Z"/>
                </svg>
              )},
              { label: "GitHub", href: "https://github.com/", icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 .5C5.73.5.98 5.24.98 11.5c0 4.85 3.14 8.96 7.5 10.41.55.1.75-.24.75-.53v-1.86c-3.05.67-3.69-1.29-3.69-1.29-.5-1.27-1.23-1.61-1.23-1.61-1-.69.07-.67.07-.67 1.1.08 1.68 1.13 1.68 1.13.99 1.7 2.6 1.21 3.23.92.1-.73.39-1.21.71-1.49-2.44-.28-5.01-1.22-5.01-5.43 0-1.2.43-2.17 1.13-2.94-.11-.28-.49-1.42.1-2.95 0 0 .92-.29 3.01 1.12a10.3 10.3 0 0 1 5.48 0c2.09-1.41 3.01-1.12 3.01-1.12.59 1.53.21 2.67.1 2.95.7.77 1.13 1.74 1.13 2.94 0 4.22-2.58 5.14-5.04 5.41.4.34.76 1 .76 2.03v3.01c0 .29.2.63.76.53 4.35-1.45 7.49-5.56 7.49-10.41C23.02 5.24 18.27.5 12 .5Z"/>
                </svg>
              )},
              { label: "Instagram", href: "https://instagram.com/", icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5.2A4.8 4.8 0 1 0 16.8 13 4.81 4.81 0 0 0 12 8.2Zm0 7.6A2.8 2.8 0 1 1 14.8 13 2.8 2.8 0 0 1 12 15.8Zm5.85-9.9a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3Z" fill="currentColor"/>
                </svg>
              )},
            ].map(({ label, href, icon }) => (
              <a key={label} href={href} className="flex items-center gap-3 rounded-xl p-3 cr-glass-hover" style={{
                border: "1px solid rgba(255,255,255,0.14)",
                background: "linear-gradient(180deg, #1e2a4d 0%, #0f1a3a 60%, #0b1530 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.45)",
              }}>
                <span className="inline-grid place-items-center rounded-md" style={{ width: 28, height: 28, background: "#fff", color: "#0b1530" }}>
                  {icon}
                </span>
                <span className="text-sm text-white/90">{label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Speaking */}
        <div className="lg:col-span-3">
          <div className="mb-2 font-semibold text-white/95 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 10h4l3 3V7l-3 3H4v8h16v-2H6v-6Z" fill="currentColor"/>
            </svg>
            <span>Speaking</span>
          </div>
          <div className="rounded-xl p-3 relative overflow-hidden" style={{
            background: "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
          }}>
            <p className="text-white/85 text-sm leading-relaxed">Available for speaking at events about software development and emerging technologies.</p>
            <a href="#contact" className="mt-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-semibold text-white active:translate-y-0.5 transition cr-glass-hover" style={{
              border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
              background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
            }}>
              <span>Get in touch</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>

        {/* Contact tiles */}
        <div className="lg:col-span-3 grid gap-3">
          {[
            { title: "Email", desc: "bryll@email.com" },
            { title: "Let's Talk", desc: "Schedule a Call" },
            { title: "Community", desc: "Join Discussion" },
          ].map(({ title, desc }) => (
            <a key={title} href="#contact" className="rounded-xl p-3 flex items-center justify-between cr-glass-hover" style={{
              border: "1px solid rgba(255,255,255,0.14)",
              background: "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
            }}>
              <div>
                <div className="font-semibold text-white/90 text-sm">{title}</div>
                <div className="text-xs text-white/70">{desc}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </Card>
  );
}
