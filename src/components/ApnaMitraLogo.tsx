import React from "react";

interface ApnaMitraLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "full" | "horizontal" | "icon";
  showTagline?: boolean;
  className?: string;
}

export const ApnaMitraLogo: React.FC<ApnaMitraLogoProps> = ({
  size = "md",
  variant = "horizontal",
  showTagline = true,
  className = "",
}) => {
  // Dimensions map
  const iconSizeMap = {
    xs: { w: 32, h: 32 },
    sm: { w: 40, h: 40 },
    md: { w: 52, h: 52 },
    lg: { w: 72, h: 72 },
    xl: { w: 104, h: 104 },
    "2xl": { w: 140, h: 140 },
  };

  const { w, h } = iconSizeMap[size] || iconSizeMap.md;

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('navigateHome'));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick(e);
    }
  };

  // The Emblem SVG containing the caregiver shaking hands with senior with cane, green heart, and cupped hands
  const EmblemSvg = (
    <svg
      width={w}
      height={h}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 drop-shadow-xs select-none"
    >
      <defs>
        {/* Navy Blue Color Palette */}
        <linearGradient id="navyPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B2B56" />
          <stop offset="100%" stopColor="#123B70" />
        </linearGradient>
        {/* Fresh Green Color Palette */}
        <linearGradient id="greenPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#66A82E" />
          <stop offset="100%" stopColor="#538E22" />
        </linearGradient>
      </defs>

      {/* Background soft white circle */}
      <circle cx="100" cy="100" r="94" fill="#FFFFFF" />

      {/* 1. TOP CIRCULAR ENCLOSING ARCS */}
      {/* Left Blue Circular Arc */}
      <path
        d="M 38 78 A 78 78 0 0 1 100 22"
        stroke="#0D2E5C"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      {/* Right Green Circular Arc */}
      <path
        d="M 100 22 A 78 78 0 0 1 162 78"
        stroke="#66A82E"
        strokeWidth="6.5"
        strokeLinecap="round"
      />

      {/* 2. GROUND WALKING CURVE */}
      <path
        d="M 54 100 Q 100 96 146 100"
        stroke="#123B70"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* 3. CAREGIVER SILHOUETTE (NAVY BLUE - LEFT) */}
      {/* Head */}
      <circle cx="90" cy="45" r="7" fill="#0E3160" />
      {/* Torso, Leaning Forward & Extended Hand */}
      <path
        d="M 87 53 C 83 55 77 62 76 72 L 72 87 L 78 88 L 81 76 L 85 76 L 81 99 L 88 99 L 91 80 L 95 99 L 102 99 L 96 74 C 99 74 103 72 108 68 L 104 65 C 100 68 96 69 94 66 L 93 54 Z"
        fill="#0E3160"
      />
      {/* Caregiver Left Arm hanging naturally */}
      <path
        d="M 77 64 L 69 77 L 73 79 L 81 66 Z"
        fill="#0E3160"
      />
      {/* Caregiver Right Arm extending for handshake */}
      <path
        d="M 88 60 L 103 69 L 109 69 L 104 66 L 92 57 Z"
        fill="#0E3160"
      />

      {/* 4. SENIOR CITIZEN SILHOUETTE WITH CANE (CHARCOAL/GREY - RIGHT) */}
      {/* Senior Head (slightly tilted forward) */}
      <circle cx="116" cy="48" r="6.5" fill="#47515B" />
      {/* Senior Body, slight stoop */}
      <path
        d="M 118 55 C 122 57 127 64 128 73 L 132 87 L 126 88 L 124 77 L 120 77 L 122 99 L 116 99 L 114 80 L 111 99 L 105 99 L 109 74 C 107 74 104 71 101 68 L 105 65 C 108 68 111 69 113 66 L 114 55 Z"
        fill="#47515B"
      />
      {/* Handshake meeting point */}
      <circle cx="106" cy="68" r="3.5" fill="#1B477A" />

      {/* Senior Walking Cane */}
      <path
        d="M 112 73 L 112 99"
        stroke="#47515B"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Cane Curved Handle */}
      <path
        d="M 115 72 Q 112 69 109 72"
        stroke="#47515B"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* 5. GREEN HEART SYMBOL (CENTER BELOW GROUND) */}
      <path
        d="M 100 126 C 97 122 90 114 90 110 C 90 106 93 103 97 103 C 99 103 100 105 100 105 C 100 105 101 103 103 103 C 107 103 110 106 110 110 C 110 114 103 122 100 126 Z"
        stroke="#66A82E"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* 6. SUPPORTIVE CUPPED HANDS (NAVY BLUE - BOTTOM CRADLE) */}
      {/* Left Caring Hand */}
      <path
        d="M 100 148 C 88 142 66 128 50 108 C 42 98 37 87 36 86 C 36 86 38 97 44 110 C 50 122 62 136 78 144 C 88 149 96 151 100 152 Z"
        fill="url(#navyPrimary)"
      />
      <path
        d="M 40 92 C 40 92 47 114 62 128 C 74 139 88 145 98 148 C 96 142 85 130 72 118 C 59 106 48 94 40 92 Z"
        fill="#0E3364"
      />
      {/* Left inner finger accent */}
      <path
        d="M 54 104 C 54 104 68 122 84 132 C 92 137 98 140 100 141 C 94 135 82 124 70 112 C 60 102 54 104 54 104 Z"
        fill="#123B70"
      />

      {/* Right Caring Hand */}
      <path
        d="M 100 148 C 112 142 134 128 150 108 C 158 98 163 87 164 86 C 164 86 162 97 156 110 C 150 122 138 136 122 144 C 112 149 104 151 100 152 Z"
        fill="url(#navyPrimary)"
      />
      <path
        d="M 160 92 C 160 92 153 114 138 128 C 126 139 112 145 102 148 C 104 142 115 130 128 118 C 141 106 152 94 160 92 Z"
        fill="#0E3364"
      />
      {/* Right inner finger accent */}
      <path
        d="M 146 104 C 146 104 132 122 116 132 C 108 137 102 140 100 141 C 106 135 118 124 130 112 C 140 102 146 104 146 104 Z"
        fill="#123B70"
      />
      
      {/* Bottom Center Joint of Hands */}
      <path
        d="M 100 153 L 95 142 L 105 142 Z"
        fill="#0A264D"
      />
    </svg>
  );

  if (variant === "icon") {
    return (
      <a href="#home" onClick={handleClick} onKeyDown={handleKeyDown} role="button" tabIndex={0} aria-label="Go to Home" className={`inline-flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-xl transition-transform hover:scale-105 active:scale-95 ${className}`}>
        {EmblemSvg}
      </a>
    );
  }

  if (variant === "full") {
    return (
      <a href="#home" onClick={handleClick} onKeyDown={handleKeyDown} role="button" tabIndex={0} aria-label="Go to Home" className={`flex flex-col items-center text-center select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-xl p-2 transition-transform hover:scale-105 active:scale-95 ${className}`}>
        {/* Circular Emblem */}
        <div className="relative group cursor-pointer">
          {EmblemSvg}
        </div>

        {/* Brand Name Typography: 'Apna Mitra' */}
        <div className="mt-2 flex items-baseline justify-center tracking-tight font-serif">
          <span className="text-[#0D2E5C] font-bold text-2xl sm:text-3xl">
            Apna
          </span>
          <span className="text-[#62A22B] font-bold text-2xl sm:text-3xl ml-1.5">
            Mitra
          </span>
        </div>

        {/* Tagline: '— साथ आपका, सेवा हमारी —' */}
        {showTagline && (
          <div className="mt-1 flex items-center justify-center text-stone-600 text-xs sm:text-sm font-medium tracking-wide">
            <span className="text-stone-400 mr-1.5">—</span>
            <span className="font-sans font-medium text-stone-700">अपनों का साथ, हर उम्र में खास</span>
            <span className="text-stone-400 ml-1.5">—</span>
          </div>
        )}
      </a>
    );
  }

  // Default: Horizontal Layout (Emblem on Left, Typography on Right)
  return (
    <a href="#home" onClick={handleClick} onKeyDown={handleKeyDown} role="button" tabIndex={0} aria-label="Go to Home" className={`inline-flex items-center gap-3 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-xl p-1.5 transition-transform hover:scale-105 active:scale-95 ${className}`}>
      <div className="relative shrink-0">
        {EmblemSvg}
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline tracking-tight font-serif leading-none">
          <span className="text-[#0D2E5C] font-bold text-xl sm:text-2xl">
            Apna
          </span>
          <span className="text-[#62A22B] font-bold text-xl sm:text-2xl ml-1">
            Mitra
          </span>
        </div>
        
        {showTagline && (
          <div className="flex items-center text-[11px] sm:text-xs text-stone-600 font-medium tracking-wide mt-1">
            <span className="text-stone-400 mr-1">—</span>
            <span className="font-sans text-stone-700 font-medium">अपनों का साथ, हर उम्र में खास</span>
            <span className="text-stone-400 ml-1">—</span>
          </div>
        )}
      </div>
    </a>
  );
};
