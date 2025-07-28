
"use client";

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Mic, Loader2 } from 'lucide-react';
import * as Tone from 'tone';
import { generateSpeech } from '@/ai/flows/text-to-speech-flow';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/context/language-context';

export function FakeCallScreen({ onEndCall }) {
  const { t } = useTranslation();
  const callerName = t('fake_call_screen.caller_name');
  const { toast } = useToast();
  const [callStatus, setCallStatus] = useState('ringing'); // 'ringing', 'connecting', 'connected'
  const [speechAudioUrl, setSpeechAudioUrl] = useState(null);
  const [timer, setTimer] = useState(0);

  const ringtoneRef = useRef(null);
  const audioRef = useRef(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    const playRingtone = async () => {
        await Tone.start();
        
        const synth = new Tone.FMSynth({
            harmonicity: 2, modulationIndex: 10, oscillator: { type: "sine" },
            envelope: { attack: 0.01, decay: 0.01, sustain: 1, release: 0.5 },
            modulation: { type: "triangle" },
            modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 }
        }).toDestination();

        const pattern = new Tone.Pattern((time, note) => {
            synth.triggerAttackRelease(note, '0.8s', time);
            synth.triggerAttackRelease(note, '0.8s', time + 1);
        }, ["A4"], "up");
        
        pattern.interval = '6s';
        pattern.start(0);
        Tone.Transport.start();
        
        ringtoneRef.current = { synth, pattern };
    };
    
    playRingtone();

    return () => {
      if (Tone.Transport.state === 'started') {
        Tone.Transport.stop();
        Tone.Transport.cancel();
      }
      if (ringtoneRef.current) {
        ringtoneRef.current.pattern.stop();
        ringtoneRef.current.pattern.dispose();
        ringtoneRef.current.synth.dispose();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleAccept = async () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pattern.stop();
      ringtoneRef.current.pattern.dispose();
      ringtoneRef.current.synth.dispose();
      ringtoneRef.current = null;
      if (Tone.Transport.state === 'started') Tone.Transport.stop();
    }
    
    setCallStatus('connecting');
     
    try {
        await Tone.start();
        const response = await generateSpeech(t('fake_call_screen.ai_voice_prompt'));
        setSpeechAudioUrl(response.media);
        setCallStatus('connected');
    } catch (error) {
        console.error("Failed to generate speech:", error);
        toast({
            variant: "destructive",
            title: t('fake_call_screen.audio_error_toast.title'),
            description: t('fake_call_screen.audio_error_toast.description'),
        });
        setCallStatus('connected');
    }
  };

  const handleDecline = () => {
    onEndCall();
  };

  useEffect(() => {
    if (callStatus === 'connected') {
        timerIntervalRef.current = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 1000);
    }
    return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, [callStatus]);

  useEffect(() => {
    if (speechAudioUrl && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Error playing audio:", e));
    }
  }, [speechAudioUrl]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  const getStatusText = () => {
    switch (callStatus) {
        case 'ringing': return t('fake_call_screen.incoming');
        case 'connecting': return t('fake_call_screen.connecting');
        case 'connected': return formatTime(timer);
        default: return t('fake_call_screen.connected');
    }
  };


  return (
    <div className="fixed inset-0 bg-gray-800 z-[100] flex flex-col items-center justify-between text-white p-8">
      <div className="text-center mt-16">
        <h1 className="text-4xl font-bold">{callerName}</h1>
        <p className="text-lg mt-2 flex items-center justify-center gap-2">
            {callStatus === 'connecting' && <Loader2 className="h-5 w-5 animate-spin" />}
            {getStatusText()}
        </p>
      </div>
      
      <Avatar className="w-32 h-32 border-4 border-white">
        <AvatarImage src="https://placehold.co/128x128.png" alt={callerName} data-ai-hint="man portrait" />
        <AvatarFallback>{callerName.charAt(0)}</AvatarFallback>
      </Avatar>

      {speechAudioUrl && <audio ref={audioRef} src={speechAudioUrl} />}

      <div className="w-full flex justify-around items-center">
        {callStatus === 'ringing' ? (
          <>
            <div className="text-center">
              <Button onClick={handleDecline} className="bg-red-600 hover:bg-red-700 rounded-full h-20 w-20">
                <PhoneOff className="h-10 w-10" />
              </Button>
              <p className="mt-2">{t('fake_call_screen.decline')}</p>
            </div>
            <div className="text-center">
              <Button onClick={handleAccept} className="bg-green-600 hover:bg-green-700 rounded-full h-20 w-20">
                <Phone className="h-10 w-10" />
              </Button>
              <p className="mt-2">{t('fake_call_screen.accept')}</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-3 gap-8 mb-8 text-center">
                <div className="flex flex-col items-center gap-1">
                    <Button variant="secondary" className="rounded-full h-16 w-16 bg-white/20 hover:bg-white/30">
                        <Mic className="h-8 w-8" />
                    </Button>
                    <span className="text-xs">{t('fake_call_screen.mute')}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                     <Button variant="secondary" className="rounded-full h-16 w-16 bg-white/20 hover:bg-white/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                    </Button>
                    <span className="text-xs">{t('fake_call_screen.speaker')}</span>
                </div>
                 <div className="flex flex-col items-center gap-1">
                     <Button variant="secondary" className="rounded-full h-16 w-16 bg-white/20 hover:bg-white/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </Button>
                    <span className="text-xs">{t('fake_call_screen.add_call')}</span>
                </div>
            </div>
            <div className="text-center">
                <Button onClick={handleDecline} className="bg-red-600 hover:bg-red-700 rounded-full h-20 w-20">
                    <PhoneOff className="h-10 w-10" />
                </Button>
                <p className="mt-2">{t('fake_call_screen.end_call')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
