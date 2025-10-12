import Card from "../components/ui/Card";

const certs = [
  {
    title: "Certificate of Training – Java NC3",
    org: "BCRV TECHVOC INC & Tesda",
    href: "#",
  },
];

function CertItem({ title, org, href }: { title: string; org: string; href: string }) {
  return (
    <a href={href} className="block group">
      <div
        className="rounded-lg p-3 cr-glass-hover"
        style={{
          border: "1px solid rgba(255,255,255,0.14)",
          background:
            "linear-gradient(180deg, color-mix(in oklab, #10234a 60%, #0b1736 40%), color-mix(in oklab, #0f214a 75%, #0a1634 25%))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        <div className="text-sm font-semibold text-white/95 group-hover:text-white transition-colors">
          {title}
        </div>
        <div className="text-xs text-white/70">{org}</div>
      </div>
    </a>
  );
}

export default function Certifications() {
  return (
    <Card
      title={
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2 9.5 8H3l5.5 4-2 6L12 14l5.5 4-2-6L21 8h-6.5L12 2Z" fill="currentColor"/>
          </svg>
          <span>Recent Certifications</span>
        </>
      }
      action={
        <a
          href="#"
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-semibold text-white active:translate-y-0.5 transition cr-glass-hover"
          style={{
            border: "1px solid color-mix(in oklab, var(--cr-blue) 35%, white 10%)",
            background:
              "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 18px -10px rgba(0,0,0,0.55)",
          }}
        >
          <span>View all</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      }
      className="col-span-full lg:col-span-6"
    >
      <div className="space-y-3">
        {certs.map((c) => (
          <CertItem key={c.title} title={c.title} org={c.org} href={c.href} />)
        )}
      </div>
    </Card>
  );
}
