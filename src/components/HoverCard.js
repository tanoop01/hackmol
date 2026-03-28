"use client";

import { useState } from "react";

export default function HoverCard({ children, className, style }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...style,
        ...(hovered
          ? {
              transform: "translateY(-5px)",
              boxShadow: "0 12px 36px rgba(0,0,0,0.09)",
            }
          : {}),
      }}
    >
      {children}
    </div>
  );
}