import { ReactNode } from "react";

type Props = {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  borderless?: boolean;
};

export default function Card({ title, action, children, className, borderless }: Props) {
  const hasHeightClass = className?.includes("h-full") || className?.includes("min-h-full");
  
  return (
    <div
      className={[
        "rounded-2xl",
        borderless ? "p-0" : "backdrop-blur-sm p-5",
        borderless ? "shadow-none" : "shadow-[0_10px_30px_-16px_rgb(0_0_0_/_0.6)] hover:shadow-[0_16px_36px_-16px_rgb(0_0_0_/_0.65)] transition-shadow",
        hasHeightClass ? "flex flex-col" : "",
        className || "",
      ].join(" ")}
      style={{
        background: borderless
          ? "transparent"
          : "linear-gradient(180deg, color-mix(in oklab, var(--cr-blue) 16%, transparent), color-mix(in oklab, black 12%, transparent))",
        border: borderless ? "none" : "1px solid color-mix(in oklab, var(--cr-blue) 28%, white 4%)",
        boxShadow: borderless
          ? "none"
          : "inset 0 1px 0 color-mix(in oklab, white 8%, transparent), inset 0 -1px 0 color-mix(in oklab, black 25%, transparent), 0 10px 30px -16px rgb(0 0 0 / 0.6)",
      }}
    >
      {(title || action) && (
        <div 
          className={`flex items-center justify-between ${hasHeightClass ? "mb-3 pb-2 flex-shrink-0" : "mb-3 pb-2"}`}
          style={{
            borderBottom: "1px solid color-mix(in oklab, var(--accent) 18%, white 6%)",
          }}
        >
          {title && (
            <h3 className="text-base font-semibold tracking-tight text-white/90 flex items-center gap-2">
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      <div className={hasHeightClass ? "flex-1 min-h-0" : ""}>
      {children}
      </div>
    </div>
  );
}
