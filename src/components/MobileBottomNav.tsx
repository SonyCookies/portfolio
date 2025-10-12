"use client";
import Image from "next/image";

export default function MobileBottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 block lg:hidden"
      aria-label="Primary"
    >
      <div className="relative mx-auto max-w-6xl px-3 pb-0">
        <div
          className="h-20 rounded-t-2xl rounded-b-none backdrop-blur-sm flex items-center justify-between px-2"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--cr-blue) 28%, #0a1126 72%), color-mix(in oklab, var(--cr-blue) 18%, #070e20 82%))",
            border: "1px solid color-mix(in oklab, var(--cr-blue) 40%, white 6%)",
            boxShadow:
              "inset 0 1px 0 color-mix(in oklab, white 8%, transparent), 0 10px 30px -16px rgb(0 0 0 / 0.6)",
          }}
        >
          {/* Left group */}
          <div className="flex items-center">
            <a href="#shop" className="relative grid place-items-center size-14 px-3 border-r border-white/10">
              <Image src="/cr-shop.svg" alt="Shop" width={26} height={26} className="opacity-95" />
            </a>
            <a href="#cards" className="relative grid place-items-center size-14 px-3 border-r border-white/10">
              <Image src="/cr-cards.svg" alt="Cards" width={26} height={26} className="opacity-95" />
              <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full text-[11px] font-bold text-white"
                style={{
                  background: "linear-gradient(180deg, #e11d48, #9f1239)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >14</span>
            </a>
          </div>

          {/* Center battle panel */}
          <div className="relative -mt-6 mx-1">
            <div
              className="h-20 w-40 rounded-xl grid place-items-center text-white"
              style={{
                background: "linear-gradient(180deg, #5ea0ff 0%, #2f66d0 60%, #1e3a8a 100%)",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "0 20px 30px -18px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              <div className="grid place-items-center">
                <Image src="/battle.png" alt="Battle" width={34} height={34} />
                <div className="mt-0.5 text-[13px] font-extrabold tracking-wide" style={{ textShadow: "0 2px 0 rgba(0,0,0,0.45)" }}>Battle</div>
              </div>
            </div>
            {/* Left/Right small triangles */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-2">
              <div style={{
                width: 0, height: 0,
                borderTop: "6px solid transparent",
                borderBottom: "6px solid transparent",
                borderRight: "8px solid rgba(255,255,255,0.5)",
                filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))",
              }} />
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-2">
              <div style={{
                width: 0, height: 0,
                borderTop: "6px solid transparent",
                borderBottom: "6px solid transparent",
                borderLeft: "8px solid rgba(255,255,255,0.5)",
                filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))",
              }} />
            </div>
          </div>

          {/* Right group */}
          <div className="flex items-center">
            <a href="#tourney" className="relative grid place-items-center size-14 px-3 border-l border-white/10">
              <Image src="/cr-news.svg" alt="Tourney" width={26} height={26} className="opacity-95" />
              <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full text-[11px] font-bold text-white"
                style={{
                  background: "linear-gradient(180deg, #ef4444, #991b1b)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >1</span>
            </a>
            <a href="#clan" className="grid place-items-center size-14 px-3 border-l border-white/10">
              <Image src="/cr-clan.svg" alt="Clan" width={26} height={26} className="opacity-95" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
