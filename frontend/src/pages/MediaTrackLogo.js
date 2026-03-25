import React from "react";

export const MediaTrackLogo = ({
  size = 24,
  gap = 10,
  showText = true,
}) => {
  const s = 64;
  const ringR = 26;
  const ringStroke = 3;

  return (
    <div style={{ display: "flex", alignItems: "center", gap }}>
      {/* ICON */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${s} ${s}`}
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.35))" }}
      >
        <defs>
          {/* subtle vignette for the disk */}
          <radialGradient id="mt_disk_grad" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#121212" />
            <stop offset="70%" stopColor="#050505" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          {/* purple gradient ring */}
          <linearGradient id="mt_ring_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="45%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#6B21A8" />
          </linearGradient>

          {/* inner glow under the ring */}
          <filter id="mt_ring_glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* play icon gradient (slightly lighter at tip) */}
          <linearGradient id="mt_play_grad" x1="30%" y1="30%" x2="85%" y2="60%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>
        </defs>

        {/* dark disk */}
        <circle cx="32" cy="32" r="30" fill="url(#mt_disk_grad)" />

        {/* thin purple ring */}
        <circle
          cx="32" cy="32" r={ringR}
          fill="none"
          stroke="url(#mt_ring_grad)"
          strokeWidth={ringStroke}
          opacity="0.9"
          filter="url(#mt_ring_glow)"
        />

        {/* small accent dot on ring (around 10 o'clock) */}
        <circle cx="20" cy="22" r="3.2" fill="#BCA8FF" opacity="0.95" />

        {/* right-facing play triangle (centered) */}
        <path
          d="M28 24 L28 40 L42 32 Z"
          fill="url(#mt_play_grad)"
          opacity="0.95"
        />
      </svg>

      {/* TEXT */}
      {showText && (
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontFamily:
              'Inter, "Segoe UI", system-ui, -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif',
            letterSpacing: "0.2px",
            userSelect: "none",
            lineHeight: 1,
          }}
        >
          <span style={{ color: "#FAFAFA", fontWeight: 600, fontSize: 16 }}>Media</span>
          <span style={{ color: "#A1A1AA", fontWeight: 600, fontSize: 16 }}>Track</span>
        </div>
      )}
    </div>
  );
};
