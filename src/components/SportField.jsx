import React from 'react';

function footballMarkup() {
  return (
    <>
      <rect x="2" y="2" width="996" height="558.5" rx="8" fill="#2d8f4e" stroke="rgba(255,255,255,0.8)" strokeWidth="4" />
      <line x1="500" y1="2" x2="500" y2="560" stroke="white" strokeWidth="4" />
      <circle cx="500" cy="281.25" r="70" fill="none" stroke="white" strokeWidth="4" />
      <circle cx="500" cy="281.25" r="4" fill="white" />
      <rect x="2" y="151.25" width="140" height="260" fill="none" stroke="white" strokeWidth="4" />
      <rect x="858" y="151.25" width="140" height="260" fill="none" stroke="white" strokeWidth="4" />
      <rect x="2" y="221.25" width="50" height="120" fill="none" stroke="white" strokeWidth="4" />
      <rect x="948" y="221.25" width="50" height="120" fill="none" stroke="white" strokeWidth="4" />
      <circle cx="110" cy="281.25" r="4" fill="white" />
      <circle cx="890" cy="281.25" r="4" fill="white" />
    </>
  );
}

function basketballMarkup() {
  return (
    <>
      <rect x="2" y="2" width="936" height="496" rx="8" fill="#cf8b4c" stroke="rgba(255,255,255,0.85)" strokeWidth="4" />
      <line x1="470" y1="2" x2="470" y2="498" stroke="white" strokeWidth="4" />
      <circle cx="470" cy="250" r="60" fill="none" stroke="white" strokeWidth="4" />
      <circle cx="470" cy="250" r="4" fill="white" />
      <rect x="2" y="145" width="190" height="210" fill="none" stroke="white" strokeWidth="4" />
      <rect x="748" y="145" width="190" height="210" fill="none" stroke="white" strokeWidth="4" />
      <path d="M 192 188 Q 260 250 192 312" fill="none" stroke="white" strokeWidth="4" />
      <path d="M 748 188 Q 680 250 748 312" fill="none" stroke="white" strokeWidth="4" />
    </>
  );
}

function handballMarkup() {
  return (
    <>
      <rect x="2" y="2" width="796" height="396" rx="8" fill="#2d74b3" stroke="rgba(255,255,255,0.85)" strokeWidth="4" />
      <line x1="400" y1="2" x2="400" y2="398" stroke="white" strokeWidth="4" />
      <rect x="2" y="160" width="60" height="80" fill="none" stroke="white" strokeWidth="4" />
      <rect x="738" y="160" width="60" height="80" fill="none" stroke="white" strokeWidth="4" />
      <path d="M 62 80 A 180 180 0 0 1 62 320" fill="none" stroke="white" strokeWidth="4" />
      <path d="M 738 80 A 180 180 0 0 0 738 320" fill="none" stroke="white" strokeWidth="4" />
      <path d="M 62 135 A 125 125 0 0 1 62 265" fill="none" stroke="white" strokeWidth="4" opacity="0.8" />
      <path d="M 738 135 A 125 125 0 0 0 738 265" fill="none" stroke="white" strokeWidth="4" opacity="0.8" />
    </>
  );
}

export default function SportField({ sport }) {
  const markup = sport === 'basketball' ? basketballMarkup() : sport === 'handball' ? handballMarkup() : footballMarkup();
  const viewBox = sport === 'basketball' ? '0 0 940 500' : sport === 'handball' ? '0 0 800 400' : '0 0 1000 562.5';

  return (
    <svg viewBox={viewBox} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0 }}>
      {markup}
    </svg>
  );
}
