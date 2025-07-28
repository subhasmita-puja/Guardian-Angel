
"use client";

import { Button } from '@/components/ui/button';
import { Siren } from 'lucide-react';
import { useTranslation } from '@/context/language-context';

export function SirenButton({ isPlaying, onToggle }) {
  const { t } = useTranslation();
  return (
    <Button
      variant="outline"
      size="lg"
      className={`transition-all duration-300 w-full max-w-sm ${isPlaying ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 animate-pulse' : 'border-primary/50 text-primary hover:bg-primary/10 hover:border-primary'}`}
      onClick={onToggle}
    >
      <Siren className="mr-2 h-5 w-5" />
      {isPlaying ? t('siren_button.deactivate') : t('siren_button.activate')}
    </Button>
  );
}
