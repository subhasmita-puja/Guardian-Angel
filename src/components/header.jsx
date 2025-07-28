
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Home, Map, Shield, Users, MessageSquare, Menu, X, Heart, Star, Bell, Globe } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTranslation } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { language, setLanguage, t } = useTranslation();

  const navLinks = [
    { href: "/home", label: t('header.nav.home'), icon: Home },
    { href: "/safemap", label: t('header.nav.safemap'), icon: Map },
    { href: "/tools", label: t('header.nav.tools'), icon: Shield },
    { href: "/contacts", label: t('header.nav.contacts'), icon: Users },
    { href: "/community", label: t('header.nav.community'), icon: MessageSquare },
    { href: "/alerts", label: t('header.nav.alerts'), icon: Bell },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Effect to lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    // Cleanup on component unmount
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobileMenuOpen]);


  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/home" className="flex items-center space-x-3">
             <div className="relative group">
                  <div className="relative p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-md border border-white/30">
                    <Shield className="h-8 w-8 text-white" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-background"></div>
                  </div>
              </div>
              <div className="text-left">
                  <h1 className="text-xl font-bold font-headline text-foreground">
                      {t('header.title')}
                  </h1>
                   <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                      <Star className="h-3 w-3 text-primary/80" />
                      {t('header.subtitle')}
                      <Heart className="h-3 w-3 text-primary/80" />
                  </p>
              </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navLinks.map(({ href, icon: Icon, label }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-lg w-20 h-16 transition-colors duration-300",
                    isActive
                      ? 'bg-gradient-to-br from-primary to-fuchsia-500 text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-primary'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>{language.toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setLanguage('en')}>{t('header.lang_switcher.en')}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setLanguage('hi')}>{t('header.lang_switcher.hi')}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setLanguage('or')}>{t('header.lang_switcher.or')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center justify-center w-10 h-10">
              {isMounted && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 bg-secondary rounded-lg w-full h-full flex items-center justify-center"
                  aria-label={t('header.toggle_menu')}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6 text-primary" />
                  ) : (
                    <Menu className="h-6 w-6 text-primary" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation Menu */}
      {isMounted && isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-20 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <nav 
            onClick={(e) => e.stopPropagation()}
            className="fixed top-20 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-primary/20 shadow-2xl animate-in fade-in-20 slide-in-from-top-5"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="grid grid-cols-3 gap-3">
                {navLinks.map(({ href, icon: Icon, label }) => {
                   const isActive = pathname.startsWith(href);
                   return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex flex-col items-center py-3 px-2 rounded-lg transition-all duration-300",
                        isActive
                          ? 'bg-gradient-to-br from-primary to-fuchsia-500 text-primary-foreground shadow-lg'
                          : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                      )}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-xs font-semibold text-center">{label}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-4 border-t pt-4">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Globe className="h-4 w-4 mr-2" />
                        <span>{language.toUpperCase()}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-56">
                       <DropdownMenuItem onSelect={() => setLanguage('en')}>{t('header.lang_switcher.en')}</DropdownMenuItem>
                       <DropdownMenuItem onSelect={() => setLanguage('hi')}>{t('header.lang_switcher.hi')}</DropdownMenuItem>
                       <DropdownMenuItem onSelect={() => setLanguage('or')}>{t('header.lang_switcher.or')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
