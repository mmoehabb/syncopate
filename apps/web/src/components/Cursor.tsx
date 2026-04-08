"use client";

import { useEffect, useState } from "react";

export function Cursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updatePosition);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 w-4 h-4 bg-neon-pulse rounded-full pointer-events-none z-[9999]"
      style={{
        transform: `translate3d(${position.x - 8}px, ${position.y - 8}px, 0)`,
        boxShadow: "0 0 10px 2px rgba(0, 245, 255, 0.5)",
      }}
    />
  );
}
