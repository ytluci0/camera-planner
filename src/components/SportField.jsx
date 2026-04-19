import React from "react";

function levelRects(width, height, activeLevels = []) {
  const levels = [
    {
      id: 1,
      padX: 80,
      padY: 80,
      fill: "rgba(120, 120, 120, 0.16)",
      stroke: "rgba(30, 30, 30, 0.45)"
    },
    {
      id: 2,
      padX: 160,
      padY: 160,
      fill: "rgba(100, 100, 100, 0.18)",
      stroke: "rgba(20, 20, 20, 0.50)"
    },
    {
      id: 3,
      padX: 250,
      padY: 250,
      fill: "rgba(80, 80, 80, 0.20)",
      stroke: "rgba(10, 10, 10, 0.55)"
    }
  ].filter((item) => activeLevels.includes(item.id));

  return levels.map((level) => {
    const x = 2 - level.padX;
    const y = 2 - level.padY;
    const rectWidth = width - 4 + level.padX * 2;
    const rectHeight = height - 4 + level.padY * 2;

    return (
      <rect
        key={`level-${level.id}`}
        x={x}
        y={y}
        width={rectWidth}
        height={rectHeight}
        rx="8"
        fill={level.fill}
        stroke={level.stroke}
        strokeWidth="1.5"
      />
    );
  });
}

function footballMarkup(activeLevels) {
  return (
    <>
      {levelRects(1000, 562.5, activeLevels)}
      <rect
        x="2"
        y="2"
        width="996"
        height="558.5"
        rx="8"
        fill="#2d8f4e"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="4"
      />
      <line x1="500" y1="2" x2="500" y2="560" stroke="white" strokeWidth="4" />
      <circle
        cx="500"
        cy="281.25"
        r="70"
        fill="none"
        stroke="white"
        strokeWidth="4"
      />
      <circle cx="500" cy="281.25" r="4" fill="white" />
      <rect
        x="2"
        y="151.25"
        width="140"
        height="260"
        fill="none"
        stroke="white"
        strokeWidth="4"
      />
      <rect
        x="858"
        y="151.25"
        width="140"
        height="260"
        fill="none"
        stroke="white"
        strokeWidth="4"
      />
      <rect
        x="2"
        y="221.25"
        width="50"
        height="120"
        fill="none"
        stroke="white"
        strokeWidth="4"
      />
      <rect
        x="948"
        y="221.25"
        width="50"
        height="120"
        fill="none"
        stroke="white"
        strokeWidth="4"
      />
      <circle cx="110" cy="281.25" r="4" fill="white" />
      <circle cx="890" cy="281.25" r="4" fill="white" />
    </>
  );
}

function basketballMarkup(activeLevels) {
  return (
    <>
      {levelRects(940, 500, activeLevels)}
      <rect
        x="2"
        y="2"
        width="936"
        height="496"
        rx="8"
        fill="#cf8b4c"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="4"
      />
      <line x1="470" y1="2" x2="470" y2="498" stroke="white" strokeWidth="4" />
      <circle
        cx="470"
        cy="250"
        r="60"
        fill="none"
        stroke="white"
        strokeWidth="4"
      />
      <circle cx="470" cy="250" r="4" fill="white" />
      <rect
        x="2"
        y="145"
        width="190"
        height="210"
        fill="none"
        stroke="white"
        strokeWidth="4"
      />
      <rect
        x="748"
        y="145"
        width="190"
        height="210"
        fill="none"
        stroke="white"
        strokeWidth="4"
      />
      <path
        d="M 192 188 Q 260 250 192 312"
        fill="none"
        stroke="white"
        strokeWidth="4"
      />
      <path
        d="M 748 188 Q 680 250 748 312"
        fill="none"
        stroke="white"
        strokeWidth="4"
      />
    </>
  );
}

function handballMarkup(activeLevels) {
  return (
    <>
      {levelRects(800, 400, activeLevels)}
      <rect
        x="2"
        y="2"
        width="796"
        height="396"
        rx="8"
        fill="#2d74b3"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="4"
      />
      <line x1="400" y1="2" x2="400" y2="398" stroke="white" strokeWidth="4" />
      <rect
        x="2"
        y="160"
        width="60"
        height="80"
        fill="none"
        stroke="white"
        strokeWidth="4"
      />
      <rect
        x="738"
        y="160"
        width="60"
        height="80"
        fill="none"
        stroke="white"
        strokeWidth="4"
      />
      <path
        d="M 62 80 A 180 180 0 0 1 62 320"
        fill="none"
        stroke="white"
        strokeWidth="4"
      />
      <path
        d="M 738 80 A 180 180 0 0 0 738 320"
        fill="none"
        stroke="white"
        strokeWidth="4"
      />
      <path
        d="M 62 135 A 125 125 0 0 1 62 265"
        fill="none"
        stroke="white"
        strokeWidth="4"
        opacity="0.8"
      />
      <path
        d="M 738 135 A 125 125 0 0 0 738 265"
        fill="none"
        stroke="white"
        strokeWidth="4"
        opacity="0.8"
      />
    </>
  );
}

export default function SportField({ sport, activeLevels = [] }) {
  const markup =
    sport === "basketball"
      ? basketballMarkup(activeLevels)
      : sport === "handball"
        ? handballMarkup(activeLevels)
        : footballMarkup(activeLevels);
  const viewBox =
  sport === "basketball"
    ? "-90 -60 1120 620"
    : sport === "handball"
      ? "-85 -55 970 520"
      : "-90 -60 1180 680";

  return (
    <svg
      viewBox={viewBox}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ position: "absolute", inset: 0 }}
    >
      {markup}
    </svg>
  );
}
