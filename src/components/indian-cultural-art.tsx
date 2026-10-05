import React from "react";

/**
 * Traditional Indian Cultural Art Components for BHRAMAN SARTHI
 * High-contrast, scalable, accessible SVG elements featuring Indian motifs:
 * Mandalas, Rangoli, Jaali screen patterns, and Toran decorative accents.
 */

export function MandalaArt({
  className = "w-12 h-12 text-amber-600",
  ariaLabel = "Traditional Indian Mandala Art",
  style,
}: {
  className?: string;
  ariaLabel?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
    >
      <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="50" cy="50" r="14" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
      
      {/* 8 Outer Petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
        <g key={i} transform={`rotate(${deg} 50 50)`}>
          <path
            d="M50 10 C54 22 54 28 50 34 C46 28 46 22 50 10 Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="50" cy="6" r="2.5" fill="currentColor" />
          <path d="M50 38 L50 44" stroke="currentColor" strokeWidth="1.5" />
        </g>
      ))}

      {/* 8 Inner Rays */}
      {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg, i) => (
        <g key={i} transform={`rotate(${deg} 50 50)`}>
          <path
            d="M50 20 Q53 28 50 36 Q47 28 50 20 Z"
            fill="currentColor"
            fillOpacity="0.4"
          />
        </g>
      ))}
      <circle cx="50" cy="50" r="4" fill="currentColor" />
    </svg>
  );
}

export function JaaliBorder({ className = "w-full h-3 text-amber-500/40" }: { className?: string }) {
  return (
    <div className={`overflow-hidden flex items-center justify-center ${className}`} aria-hidden="true">
      <svg width="100%" height="12" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="jaali-pattern" width="24" height="12" patternUnits="userSpaceOnUse">
            <path d="M0 6 Q6 0 12 6 Q18 12 24 6 Q18 0 12 6 Q6 12 0 6 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="12" cy="6" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#jaali-pattern)" />
      </svg>
    </div>
  );
}

export function RangoliMotif({ className = "w-8 h-8 text-orange-600" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M30 5 C35 20 40 25 55 30 C40 35 35 40 30 55 C25 40 20 35 5 30 C20 25 25 20 30 5 Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="30" cy="30" r="8" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="30" cy="30" r="3" fill="currentColor" />
      {/* 4 Corner Dots */}
      <circle cx="15" cy="15" r="2.5" fill="currentColor" />
      <circle cx="45" cy="15" r="2.5" fill="currentColor" />
      <circle cx="15" cy="45" r="2.5" fill="currentColor" />
      <circle cx="45" cy="45" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function AnimatedTransitArrow({ className = "w-6 h-6 text-orange-600" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center animate-arrow-flow ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </div>
  );
}

export function CulturalHeaderDecoration() {
  return (
    <div className="w-full h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-indigo-700" aria-hidden="true" />
  );
}
