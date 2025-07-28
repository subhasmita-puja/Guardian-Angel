"use client";

import { Button } from '@/components/ui/button';
import { Siren } from 'lucide-react';

export function SirenButton({ isPlaying, onToggle }) {
  return (
    <Button
      variant="outline"
      size="lg"
      className={`transition-all duration-300 w-full ${isPlaying ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 animate-pulse' : 'border-accent'}`}
      onClick={onToggle}
    >
      <Siren className="mr-2 h-5 w-5" />
      {isPlaying ? 'Deactivate Siren' : 'Activate Siren'}
    </Button>
  );
}
