export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="col-span-full">
      <div className="h-px w-full" style={{
        background: "linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
      }} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 items-start">
        <div className="text-sm text-white/80">
          © {year} <span className="font-semibold text-white">Sonny Sarcia</span>. All rights reserved.
        </div>
        <div className="text-right text-sm">
          <div className="text-white/85">
            Coded from scratch using <span className="font-semibold text-white">Next.js</span> and <span className="font-semibold text-white">Tailwind CSS</span>.
          </div>
          <div className="text-white/60 text-xs">Layout inspiration from Bryl Lim. Design heavily influenced by Clash Royale.</div>
        </div>
      </div>
    </footer>
  );
}
