import React from "react";
import Image from "next/image";

export function Logo({
  width,
  height,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo.svg"
      alt="Logo"
      width={width ?? 35}
      height={height ?? 35}
      className={className}
    />
  );
}
