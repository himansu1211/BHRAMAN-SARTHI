import React from "react";

/**
 * Inspiration: Mughal & Rajput carved stone lattice screens (Jaali).
 * Usage: Ornamental top/bottom border bands for Header and Footer.
 */
export function JaaliBorder({
  className = "w-full text-gold-line opacity-60",
  height = 12,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <svg
      className={className}
      height={height}
      width="100%"
      preserveAspectRatio="none"
      viewBox="0 0 1200 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <pattern id="jaali-pattern" width="32" height="16" patternUnits="userSpaceOnUse">
        {/* Repeating Octagonal & Diamond Jaali Lattice */}
        <path
          d="M16 0L32 8L16 16L0 8L16 0Z"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
        <circle cx="16" cy="8" r="2.5" fill="currentColor" opacity="0.8" />
        <path d="M0 0L32 16M0 16L32 0" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      </pattern>
      <rect width="1200" height="16" fill="url(#jaali-pattern)" />
    </svg>
  );
}

/**
 * Inspiration: South Indian Kolam & Rangoli geometric dot-and-loop floor art (Tamil Nadu & Kerala).
 * Usage: Horizontal section dividers and timeline step indicators.
 */
export function KolamDivider({
  className = "my-6 text-gold-line",
  width: _width = "100%",
}: {
  className?: string;
  width?: string | number;
}) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-amber-300 to-amber-500 opacity-60" />
      <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Kolam Central Flower Dot Loops */}
        <circle cx="20" cy="10" r="3" fill="#C8321E" />
        <circle cx="10" cy="10" r="2" fill="#C9A24B" />
        <circle cx="30" cy="10" r="2" fill="#C9A24B" />
        <path
          d="M20 3 C14 3 14 17 20 17 C26 17 26 3 20 3 Z"
          stroke="#C9A24B"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M13 10 C13 4 27 4 27 10 C27 16 13 16 13 10 Z"
          stroke="#C8321E"
          strokeWidth="1"
          fill="none"
        />
      </svg>
      <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent via-amber-300 to-amber-500 opacity-60" />
    </div>
  );
}

/**
 * Inspiration: Rajput & Mughal cusped doorway arches (Toran).
 * Usage: Card headers, modal top edges, and section crowns.
 */
export function ToranArch({
  className = "text-amber-200",
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <div className="relative w-full overflow-hidden" aria-hidden="true">
      <svg
        className={`w-full ${className}`}
        height="24"
        viewBox="0 0 600 24"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Traditional Cusped Gateway Arch */}
        <path
          d="M0 0 H600 V12 C550 12 525 24 500 24 C475 24 450 12 400 12 C350 12 325 24 300 24 C275 24 250 12 200 12 C150 12 125 24 100 24 C75 24 50 12 0 12 V0 Z"
          fill="currentColor"
        />
        <path
          d="M0 12 C50 12 75 24 100 24 C125 24 150 12 200 12 C250 12 275 24 300 24 C325 24 350 12 400 12 C450 12 475 24 500 24 C525 24 550 12 600 12"
          stroke="#C9A24B"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
      {title && (
        <span className="sr-only">{title}</span>
      )}
    </div>
  );
}

/**
 * Inspiration: Mithila / Madhubani folk painting from Bihar (double lines and floral fills).
 * Usage: Decorative frame overlay for main containers and tickets.
 */
export function MadhubaniBorder({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative rounded-3xl border-2 border-double border-amber-600/80 bg-paper-light p-1 shadow-yatra-md ${className}`}>
      {/* Corner Floral Motifs */}
      <svg
        className="absolute -top-2 -left-2 h-6 w-6 text-vermilion pointer-events-none"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        <circle cx="12" cy="12" r="2" fill="#E8A317" />
      </svg>
      <svg
        className="absolute -top-2 -right-2 h-6 w-6 text-vermilion pointer-events-none"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        <circle cx="12" cy="12" r="2" fill="#E8A317" />
      </svg>

      <div className="search-content rounded-[20px] bg-paper-light p-4 sm:p-6">{children}</div>

      <svg
        className="absolute -bottom-2 -left-2 h-6 w-6 text-vermilion pointer-events-none"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        <circle cx="12" cy="12" r="2" fill="#E8A317" />
      </svg>
      <svg
        className="absolute -bottom-2 -right-2 h-6 w-6 text-vermilion pointer-events-none"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        <circle cx="12" cy="12" r="2" fill="#E8A317" />
      </svg>
    </div>
  );
}

/**
 * Inspiration: Warli Tribal Folk Art of Maharashtra (geometric stick figures).
 * Usage: Empty state illustrations, error states, and transport mode line art.
 */
export function WarliFigure({
  type = "traveler",
  className = "w-16 h-16 text-terracotta",
  size = 64,
}: {
  type?: "traveler" | "train" | "flight" | "bus" | "empty_state" | "compass";
  className?: string;
  size?: number;
}) {
  if (type === "traveler") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        {/* Warli Traveler: Triangular Head & Torso with Journey Staff & Bag */}
        <circle cx="32" cy="14" r="5" fill="currentColor" />
        {/* Triangles meeting at waist */}
        <polygon points="32,20 22,34 42,34" fill="currentColor" />
        <polygon points="32,44 24,34 40,34" fill="currentColor" />
        {/* Legs */}
        <path d="M26 44L22 58M38 44L42 58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {/* Arms holding walking staff */}
        <path d="M24 24L12 36M40 24L50 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {/* Staff line */}
        <line x1="50" y1="8" x2="50" y2="58" stroke="#C8321E" strokeWidth="2" strokeLinecap="round" />
        {/* Luggage bag on back */}
        <rect x="14" y="26" width="8" height="10" rx="2" fill="#C9A24B" />
      </svg>
    );
  }

  if (type === "train") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        {/* Warli Stylized Express Locomotive */}
        <rect x="10" y="24" width="44" height="24" rx="4" fill="currentColor" />
        <rect x="16" y="28" width="10" height="8" rx="1" fill="#FFFDF9" />
        <rect x="30" y="28" width="10" height="8" rx="1" fill="#FFFDF9" />
        <rect x="44" y="28" width="6" height="8" rx="1" fill="#FFFDF9" />
        {/* Wheels */}
        <circle cx="18" cy="50" r="4" fill="#2B1B14" stroke="#FFFDF9" strokeWidth="1.5" />
        <circle cx="32" cy="50" r="4" fill="#2B1B14" stroke="#FFFDF9" strokeWidth="1.5" />
        <circle cx="46" cy="50" r="4" fill="#2B1B14" stroke="#FFFDF9" strokeWidth="1.5" />
        {/* Track */}
        <line x1="6" y1="55" x2="58" y2="55" stroke="currentColor" strokeWidth="2" />
        {/* Speed plume */}
        <path d="M10 20C14 16 20 16 24 20" stroke="#E8A317" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "flight") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        {/* Warli Aircraft */}
        <path
          d="M32 10 L38 28 L56 34 L38 38 L36 52 L32 48 L28 52 L26 38 L8 34 L26 28 Z"
          fill="currentColor"
        />
        <circle cx="32" cy="20" r="2" fill="#FFFDF9" />
      </svg>
    );
  }

  if (type === "bus") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        {/* Warli Bus */}
        <rect x="12" y="20" width="40" height="26" rx="4" fill="currentColor" />
        <rect x="16" y="24" width="8" height="10" rx="1" fill="#FFFDF9" />
        <rect x="28" y="24" width="8" height="10" rx="1" fill="#FFFDF9" />
        <rect x="40" y="24" width="8" height="10" rx="1" fill="#FFFDF9" />
        <circle cx="20" cy="48" r="4" fill="#2B1B14" stroke="#FFFDF9" strokeWidth="1.5" />
        <circle cx="44" cy="48" r="4" fill="#2B1B14" stroke="#FFFDF9" strokeWidth="1.5" />
      </svg>
    );
  }

  // Default empty state / compass motif
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Warli Village Journey Scene */}
      <circle cx="40" cy="40" r="36" stroke="#C9A24B" strokeWidth="2" strokeDasharray="4 4" />
      {/* Stick figure 1 */}
      <circle cx="30" cy="30" r="4" fill="currentColor" />
      <polygon points="30,34 22,46 38,46" fill="currentColor" />
      {/* Stick figure 2 */}
      <circle cx="50" cy="30" r="4" fill="currentColor" />
      <polygon points="50,34 42,46 58,46" fill="currentColor" />
      {/* Sun / Mandala above */}
      <circle cx="40" cy="18" r="5" fill="#E8A317" />
    </svg>
  );
}

/**
 * Inspiration: Ajrakh & Bagru hand-block printing paisleys (Boota).
 * Usage: Decorative background watermark.
 */
export function BootaPattern({ className = "text-gold-line opacity-10" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute ${className}`}
      width="120"
      height="120"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M50 10 C30 10 20 30 20 50 C20 70 35 85 50 85 C65 85 80 70 80 50 C80 35 70 25 60 25 C50 25 45 35 50 45 C55 55 45 65 35 60 C30 55 35 45 45 40 Z"
        fill="currentColor"
      />
      <circle cx="50" cy="50" r="4" fill="#C8321E" />
    </svg>
  );
}
