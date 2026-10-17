import React from "react";

// Royal Chariot Wheel (Rath Chakra / Sarthi's Wheel)
export function RathChakraIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor">
      {/* Outer rim */}
      <circle cx="24" cy="24" r="21" strokeWidth="2.5" stroke="currentColor" />
      <circle cx="24" cy="24" r="18" strokeWidth="1" strokeDasharray="3 3" stroke="currentColor" />
      {/* Inner hub */}
      <circle cx="24" cy="24" r="6" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
      <circle cx="24" cy="24" r="2.5" fill="currentColor" />
      {/* 12 Auspicious Spokes */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <line
          key={deg}
          x1="24"
          y1="24"
          x2={24 + 18 * Math.cos((deg * Math.PI) / 180)}
          y2={24 + 18 * Math.sin((deg * Math.PI) / 180)}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

// Royal Sacred Lotus (पद्म)
export function LotusIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor">
      {/* Central petal */}
      <path d="M16 4C14 10 13 18 16 26C19 18 18 10 16 4Z" />
      {/* Left petal */}
      <path
        d="M16 26C11 25 8 18 10 12C12 10 15 14 16 26Z"
        opacity="0.85"
      />
      {/* Right petal */}
      <path
        d="M16 26C21 25 24 18 22 12C20 10 17 14 16 26Z"
        opacity="0.85"
      />
      {/* Far left petal */}
      <path
        d="M16 26C7 24 3 19 6 15C9 14 13 20 16 26Z"
        opacity="0.65"
      />
      {/* Far right petal */}
      <path
        d="M16 26C25 24 29 19 26 15C23 14 19 20 16 26Z"
        opacity="0.65"
      />
      {/* Lotus Base */}
      <path d="M10 27C13 29 19 29 22 27L16 28L10 27Z" />
    </svg>
  );
}

// Traditional Diya / Deepak (मंगल दीप)
export function DiyaIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      {/* Flame with inner glow */}
      <path
        d="M12 2C12 2 15 6 15 8.5C15 10.4 13.7 12 12 12C10.3 12 9 10.4 9 8.5C9 6 12 2 12 2Z"
        fill="currentColor"
        strokeWidth="1.2"
      />
      {/* Clay bowl of the Diya */}
      <path
        d="M3 13C3.5 18 7.5 21 12 21C16.5 21 20.5 18 21 13C21 13 17 14 12 14C7 14 3 13 3 13Z"
        fill="currentColor"
        fillOpacity="0.25"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line x1="12" y1="12" x2="12" y2="14" strokeWidth="1.5" />
    </svg>
  );
}

// Royal Seal / Mudra Stamp (राजमुद्रा)
export function RoyalSealIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor">
      <circle cx="16" cy="16" r="14" strokeWidth="1.5" strokeDasharray="2 2" />
      <circle cx="16" cy="16" r="11" strokeWidth="2" />
      <polygon
        points="16,7 18.5,12 24,13 20,17 21,22.5 16,19.5 11,22.5 12,17 8,13 13.5,12"
        fill="currentColor"
        fillOpacity="0.25"
        strokeWidth="1"
      />
      <circle cx="16" cy="16" r="2.5" fill="currentColor" />
    </svg>
  );
}

// Vimana / Royal Flying Chariot (वैमानिक / दिव्य रथ) for Flights
export function VimanaIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      {/* Crowned celestial fuselage */}
      <path d="M12 2L15 8H9L12 2Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 7V17" />
      <path d="M12 11L21 15L19 17L12 14L5 17L3 15L12 11Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M9 19L12 22L15 19H9Z" fill="currentColor" />
    </svg>
  );
}

// Royal Loha Marg / Rajgadi (राजगाड़ी / लोह मार्ग) for Trains
export function RajGadiIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      {/* Ornate Arch Canopy for the Royal Train */}
      <path d="M5 6C5 4 8 2 12 2C16 2 19 4 19 6V17C19 18 18 19 17 19H7C6 19 5 18 5 17V6Z" />
      <path d="M5 9H19" />
      <path d="M12 2V9" />
      {/* Headlights / Jewels */}
      <circle cx="8" cy="14" r="1.5" fill="currentColor" />
      <circle cx="16" cy="14" r="1.5" fill="currentColor" />
      {/* Traditional track buffer */}
      <path d="M8 19L6 22M16 19L18 22" />
      <path d="M4 22H20" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Ornate Corner Flourish for Indian Manuscript Frames
export function OrnateCorner({ className = "w-4 h-4 text-amber-500" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M1 19V5C1 2.79086 2.79086 1 5 1H19" />
      <path d="M4 16V6C4 4.89543 4.89543 4 6 4H16" opacity="0.6" />
      <circle cx="2" cy="2" r="1.5" fill="currentColor" />
    </svg>
  );
}

// Traditional Torana Arch for headers / cards
export function ToranaDivider({ className = "w-full h-4 text-amber-600/40" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-600/50 to-transparent" />
      <LotusIcon className="h-4 w-4 text-amber-600 flex-shrink-0" />
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-600/50 to-transparent" />
    </div>
  );
}

// Auspicious Kalash (पूर्ण कलश)
export function KalashIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      {/* Coconut tip */}
      <path d="M12 2C13 4 14 5 14 6C14 7 13 8 12 8C11 8 10 7 10 6C10 5 11 4 12 2Z" fill="currentColor" />
      {/* Mango leaves (आम्रपल्लव) */}
      <path d="M12 6C8 5 6 7 5 9C8 9 10 8 12 7" strokeLinecap="round" />
      <path d="M12 6C16 5 18 7 19 9C16 9 14 8 12 7" strokeLinecap="round" />
      {/* Pot body (कुम्भ) */}
      <path d="M7 10H17L19 14C20 17 18 21 12 21C6 21 4 17 5 14L7 10Z" fill="currentColor" fillOpacity="0.2" />
      {/* Sacred Swastika / Thread */}
      <path d="M7 14H17" strokeWidth="1" strokeDasharray="2 1" />
    </svg>
  );
}

// Peacock Feather (मयूर पंख)
export function MayurPankhIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 3C15 4 10 9 7 14L3 21" strokeLinecap="round" />
      {/* Eye of the feather */}
      <ellipse cx="16" cy="8" rx="4" ry="3" transform="rotate(-35 16 8)" fill="currentColor" fillOpacity="0.2" />
      <circle cx="16" cy="8" r="1.5" fill="currentColor" />
      {/* Barbs */}
      <path d="M14 5C13 7 12 8 10 9M18 10C16 11 15 13 13 14M11 14C9 16 8 17 6 18" strokeLinecap="round" />
    </svg>
  );
}

// Sanskrit Royal Scroll / Bhojpatra (हस्तलिखित भोजपत्र)
export function BhojpatraIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6C4 4.5 5.5 3 7 3H19C19 4.5 17.5 6 16 6H4Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M4 6V18C4 19.5 5.5 21 7 21H19C19 19.5 17.5 18 16 18H4" />
      <path d="M16 6V18" />
      <path d="M7 9H13M7 12H13M7 15H11" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
