import React from 'react';

export const BloodDrop3D = ({ className = "" }: { className?: string }) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' className={className}>
    <defs>
      <radialGradient id='bp-grad' cx='30%' cy='30%' r='70%'>
        <stop offset='0%' stopColor='#ff8a8a'/>
        <stop offset='50%' stopColor='#e63946'/>
        <stop offset='100%' stopColor='#900010'/>
      </radialGradient>
      <filter id='shadow' x='-20%' y='-20%' width='140%' height='140%'>
        <feDropShadow dx='0' dy='15' stdDeviation='10' floodColor='#e63946' floodOpacity='0.4'/>
      </filter>
    </defs>
    <path d='M100,30 C100,30 40,100 40,140 C40,175 65,200 100,200 C135,200 160,175 160,140 C160,100 100,30 100,30 Z' fill='url(#bp-grad)' filter='url(#shadow)'/>
    <path d='M65,130 C65,110 85,75 100,60 C80,85 75,115 80,140 C70,140 65,135 65,130 Z' fill='#ffffff' opacity='0.5'/>
    <ellipse cx='125' cy='160' rx='10' ry='20' transform='rotate(-45 125 160)' fill='#ffffff' opacity='0.2'/>
  </svg>
);

export const Heart3D = ({ className = "" }: { className?: string }) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' className={className}>
    <defs>
      <radialGradient id='hr-grad' cx='35%' cy='30%' r='70%'>
        <stop offset='0%' stopColor='#ff758c'/>
        <stop offset='50%' stopColor='#ff4b72'/>
        <stop offset='100%' stopColor='#c9184a'/>
      </radialGradient>
      <filter id='shadow-hr' x='-20%' y='-20%' width='140%' height='140%'>
        <feDropShadow dx='0' dy='15' stdDeviation='12' floodColor='#c9184a' floodOpacity='0.4'/>
      </filter>
    </defs>
    <path d='M100,180 C100,180 20,120 20,70 C20,35 50,15 75,15 C88,15 100,25 100,35 C100,25 112,15 125,15 C150,15 180,35 180,70 C180,120 100,180 100,180 Z' fill='url(#hr-grad)' filter='url(#shadow-hr)'/>
    <ellipse cx='60' cy='50' rx='15' ry='25' transform='rotate(-30 60 50)' fill='#ffffff' opacity='0.6'/>
    <ellipse cx='140' cy='110' rx='8' ry='15' transform='rotate(40 140 110)' fill='#ffffff' opacity='0.3'/>
  </svg>
);

export const Lungs3D = ({ className = "" }: { className?: string }) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' className={className}>
    <defs>
      <radialGradient id='spo2-grad' cx='30%' cy='30%' r='70%'>
        <stop offset='0%' stopColor='#90e0ef'/>
        <stop offset='50%' stopColor='#00b4d8'/>
        <stop offset='100%' stopColor='#03045e'/>
      </radialGradient>
      <radialGradient id='spo2-grad2' cx='30%' cy='30%' r='70%'>
        <stop offset='0%' stopColor='#caf0f8'/>
        <stop offset='50%' stopColor='#48cae4'/>
        <stop offset='100%' stopColor='#023e8a'/>
      </radialGradient>
      <filter id='shadow-spo2' x='-20%' y='-20%' width='140%' height='140%'>
        <feDropShadow dx='0' dy='15' stdDeviation='10' floodColor='#0077b6' floodOpacity='0.4'/>
      </filter>
    </defs>
    <g filter='url(#shadow-spo2)'>
      <circle cx='100' cy='100' r='60' fill='url(#spo2-grad)'/>
      <circle cx='70' cy='60' r='15' fill='#ffffff' opacity='0.5'/>
      <circle cx='150' cy='60' r='30' fill='url(#spo2-grad2)'/>
      <circle cx='140' cy='50' r='8' fill='#ffffff' opacity='0.6'/>
      <circle cx='50' cy='140' r='20' fill='url(#spo2-grad2)'/>
      <circle cx='45' cy='135' r='5' fill='#ffffff' opacity='0.6'/>
    </g>
  </svg>
);

export const Sugar3D = ({ className = "" }: { className?: string }) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' className={className}>
    <defs>
      <linearGradient id='sugar-top' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#ffffff'/>
        <stop offset='100%' stopColor='#e2e8f0'/>
      </linearGradient>
      <linearGradient id='sugar-left' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#cbd5e1'/>
        <stop offset='100%' stopColor='#94a3b8'/>
      </linearGradient>
      <linearGradient id='sugar-right' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#f1f5f9'/>
        <stop offset='100%' stopColor='#cbd5e1'/>
      </linearGradient>
      <filter id='sugar-glow' x='-20%' y='-20%' width='140%' height='140%'>
        <feDropShadow dx='0' dy='15' stdDeviation='15' floodColor='#94a3b8' floodOpacity='0.4'/>
      </filter>
    </defs>
    <g filter='url(#sugar-glow)'>
      {/* Big Cube */}
      <g transform="translate(20, 30) scale(0.9)">
        <path d='M100,50 L145,75 L100,100 L55,75 Z' fill='url(#sugar-top)'/>
        <path d='M55,75 L100,100 L100,150 L55,125 Z' fill='url(#sugar-left)'/>
        <path d='M100,100 L145,75 L145,125 L100,150 Z' fill='url(#sugar-right)'/>
      </g>
      {/* Small Cube */}
      <g transform="translate(-20, 70) scale(0.6)">
        <path d='M100,50 L145,75 L100,100 L55,75 Z' fill='url(#sugar-top)'/>
        <path d='M55,75 L100,100 L100,150 L55,125 Z' fill='url(#sugar-left)'/>
        <path d='M100,100 L145,75 L145,125 L100,150 Z' fill='url(#sugar-right)'/>
      </g>
    </g>
  </svg>
);

export const Scale3D = ({ className = "" }: { className?: string }) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' className={className}>
    <defs>
      <linearGradient id='scale-base' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#ffffff'/>
        <stop offset='100%' stopColor='#cbd5e1'/>
      </linearGradient>
      <radialGradient id='scale-dial' cx='50%' cy='50%' r='50%'>
        <stop offset='80%' stopColor='#ffffff'/>
        <stop offset='100%' stopColor='#94a3b8'/>
      </radialGradient>
      <filter id='scale-shadow'>
        <feDropShadow dx='0' dy='15' stdDeviation='12' floodColor='#475569' floodOpacity='0.3'/>
      </filter>
    </defs>
    <g filter='url(#scale-shadow)'>
      {/* Scale Body */}
      <path d='M40,70 L160,70 C171,70 180,79 180,90 L180,150 C180,161 171,170 160,170 L40,170 C29,170 20,161 20,150 L20,90 C20,79 29,70 40,70 Z' fill='url(#scale-base)'/>
      
      {/* Top glass/plate reflection */}
      <path d='M40,70 L160,70 C171,70 180,79 180,90 L180,110 L20,110 L20,90 C20,79 29,70 40,70 Z' fill='#ffffff' opacity='0.4'/>
      
      {/* Dial */}
      <circle cx='100' cy='120' r='40' fill='url(#scale-dial)'/>
      <circle cx='100' cy='120' r='35' fill='#f8fafc'/>
      
      {/* Screen/Display in modern scales */}
      <rect x='75' y='80' width='50' height='20' rx='4' fill='#0f172a'/>
      <text x='100' y='94' fill='#22c55e' fontFamily='monospace' fontSize='12' fontWeight='bold' textAnchor='middle'>72.5</text>
      
      {/* Dial Needle (if analog style mixed in) */}
      <path d='M100,120 L115,95' stroke='#ef4444' strokeWidth='3' strokeLinecap='round'/>
      <circle cx='100' cy='120' r='5' fill='#334155'/>
    </g>
  </svg>
);
