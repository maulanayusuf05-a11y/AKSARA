import React from 'react';

interface TutWuriLogoProps {
  className?: string;
  size?: number;
}

export const TutWuriLogo: React.FC<TutWuriLogoProps> = ({ className = '', size = 52 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-sm ${className}`}
    >
      {/* Outer Glow / Halo */}
      <circle cx="60" cy="60" r="58" fill="#0284C7" fillOpacity="0.08" />
      
      {/* Circular Blue Outer Ring */}
      <circle cx="60" cy="60" r="54" fill="#0284C7" stroke="#0369A1" strokeWidth="2.5" />
      
      {/* White inner border ring */}
      <circle cx="60" cy="60" r="49" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.5" />

      {/* Golden Pentagon / Belimbing Dasar Tut Wuri Handayani */}
      <polygon
        points="60,18 96,44 82,88 38,88 24,44"
        fill="#0284C7"
        stroke="#F59E0B"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Sayap Emas Garuda / Sayap Tut Wuri (Wings) */}
      <path
        d="M60 52 C52 40, 32 46, 28 62 C34 68, 48 66, 60 76 C72 66, 86 68, 92 62 C88 46, 68 40, 60 52 Z"
        fill="#FBBF24"
        stroke="#D97706"
        strokeWidth="1.5"
      />
      {/* Inner Feather detail */}
      <path
        d="M60 56 C54 46, 38 52, 34 64 C42 66, 52 68, 60 78 C68 68, 78 66, 86 64 C82 52, 66 46, 60 56 Z"
        fill="#F59E0B"
      />

      {/* Ekor Burung (Tail feathers) */}
      <path
        d="M52 76 L60 88 L68 76 L65 84 L60 89 L55 84 Z"
        fill="#FBBF24"
        stroke="#D97706"
        strokeWidth="1"
      />

      {/* Belimbing & Api / Obor Abadi (Flame of Knowledge) */}
      <path
        d="M60 27 C62 33, 67 36, 64 43 C62 47, 58 47, 56 43 C53 36, 58 33, 60 27 Z"
        fill="#EF4444"
      />
      <path
        d="M60 32 C61 35, 64 38, 62 42 C61 44, 59 44, 58 42 C56 38, 59 35, 60 32 Z"
        fill="#FDE047"
      />

      {/* Buku Terbuka (Open Book of Education) */}
      <path
        d="M60 69 C53 65, 42 66, 36 71 L36 81 C42 76, 53 76, 60 80 C67 76, 78 76, 84 81 L84 71 C78 66, 67 65, 60 69 Z"
        fill="#FFFFFF"
        stroke="#1E293B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="60" y1="69" x2="60" y2="80" stroke="#1E293B" strokeWidth="1.5" />

      {/* Text Ring Arc simulation: "TUT WURI HANDAYANI" banner */}
      <path
        d="M32 94 Q60 106 88 94"
        stroke="#FBBF24"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M34 94 Q60 105 86 94"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Mini dots */}
      <circle cx="30" cy="93" r="2" fill="#FBBF24" />
      <circle cx="90" cy="93" r="2" fill="#FBBF24" />
    </svg>
  );
};
