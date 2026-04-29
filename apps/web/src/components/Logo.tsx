import React from "react";
import Image from "next/image";

export function Logo({ width, height }: { width?: number; height?: number }) {
  return (
    <Image
      src="/logo.svg"
      alt="Logo"
      width={width ?? 35}
      height={height ?? 35}
    />
  );
}
