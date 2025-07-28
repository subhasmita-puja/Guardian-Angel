
"use client";

import React from 'react';
import Link from 'next/link';
import { Shield, Star, Mail, Github, Twitter, Instagram, Wrench, Users, Lock, FileText, Heart } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTranslation } from '@/context/language-context';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={cn("relative mt-auto overflow-hidden bg-primary text-primary-foreground")}>
      <div className="container mx-auto px-4 sm:px-6 py-4 relative z-10">

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-primary-foreground/20 to-accent rounded-lg shadow-md">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary-foreground">{t('footer.title')}</h3>
              <p className="text-primary-foreground/80 text-sm">{t('footer.subtitle')}</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/home" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm font-medium">
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">SOS</span>
                {t('footer.emergency')}
            </Link>
            <Link href="/tools" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm font-medium">
                <Wrench className="h-4 w-4" /> {t('footer.tools')}
            </Link>
            <Link href="/community" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm font-medium">
                <Users className="h-4 w-4" /> {t('footer.community')}
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <a href={`mailto:${t('footer.contact_email')}`} className="hidden md:flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm font-medium">
                <Mail className="h-4 w-4" />
                {t('footer.contact_email')}
            </a>
            <div className="flex items-center gap-2">
                <a href="#" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors">
                    <Twitter className="h-4 w-4" />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors">
                    <Instagram className="h-4 w-4" />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors">
                    <Github className="h-4 w-4" />
                </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 my-4"></div>

        <div className="flex flex-col items-center gap-4">
            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
                <div className="text-primary-foreground/80">
                    {t('footer.copyright')}
                </div>
                
                <div className="flex items-center gap-6">
                    <Link href="#" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                        <Lock className="h-4 w-4" /> {t('footer.privacy')}
                    </Link>
                    <Link href="#" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                        <FileText className="h-4 w-4" /> {t('footer.terms')}
                    </Link>
                    <Link href="#" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">SOS</span>
                        {t('footer.support')}
                    </Link>
                </div>
            </div>
          
            <div className="mt-2 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full border border-primary-foreground/20">
                    <Star className="h-4 w-4 text-primary-foreground" />
                    <p className="text-primary-foreground/80 text-sm italic">
                        {t('footer.quote')}
                    </p>
                    <Star className="h-4 w-4 text-primary-foreground" />
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
}
