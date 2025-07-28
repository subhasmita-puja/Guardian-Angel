
"use client";

import Image from 'next/image';
import { useEffect, useRef } from 'react';

export function Classy3DBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <Image
        src="/background.jpg"
        alt="Background"
        fill
        priority
        sizes="100vw"
        className="object-cover blur-sm brightness-50"
        quality={85}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/20" />
    </div>
  );
}
