"use client";

import { Classy3DBackground } from '@/components/classy-3d-background';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { LanguageProvider } from '@/context/language-context';

export function RootWrapper({ children, fontClass }) {
  return (
    <LanguageProvider>
      <body className={cn("min-h-screen bg-background font-body antialiased", fontClass)}>
        <Classy3DBackground />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 flex flex-col pt-20">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </LanguageProvider>
  );
}