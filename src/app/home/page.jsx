
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Shield, ShieldAlert, Siren, Sparkles, Star, Heart, Send, Zap, Watch, Mic, CheckCircle, Loader2, Phone, PhoneCall } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContacts } from '@/hooks/use-contacts';
import { useAlerts } from '@/hooks/use-alerts';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { SirenButton } from '@/components/siren-button';
import { useShakeDetector } from '@/hooks/use-shake-detector';
import * as Tone from 'tone';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/context/language-context';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

const FakeCallScreen = dynamic(() => import('@/components/fake-call-screen').then(mod => mod.FakeCallScreen), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-gray-800 z-[100] flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-white"/></div>
});

export default function HomePage() {
  const { t } = useTranslation();
  const inspirationalQuotes = t('home_page.inspirational_quotes');
  const [quote, setQuote] = React.useState(inspirationalQuotes[0]);
  const [isClient, setIsClient] = React.useState(false);

  const { toast } = useToast();
  const { contacts } = useContacts();
  const { addAlert } = useAlerts();
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertContent, setAlertContent] = useState({ title: '', description: '' });

  // Siren state and logic
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const sirenRef = useRef(null);

  // Fake Call state
  const [isFakeCallActive, setIsFakeCallActive] = useState(false);

  // Voice SOS state
  const [isVoiceSOSActive, setIsVoiceSOSActive] = useState(false);
  const [isEmergencyCallVoiceActive, setIsEmergencyCallVoiceActive] = useState(false);
  const recognitionRef = useRef(null);
  const voiceSosActiveRef = useRef(isVoiceSOSActive);
  const emergencyCallActiveRef = useRef(isEmergencyCallVoiceActive);
  const commandTriggeredRef = useRef(false);

  // Smartwatch state
  const [isWatchLinked, setIsWatchLinked] = useState(false);
  const [isLinkWatchDialogOpen, setIsLinkWatchDialogOpen] = useState(false);
  const qrScannerRef = useRef(null);
  
  // Sync the voice SOS states with their refs for use in closures
  useEffect(() => {
    voiceSosActiveRef.current = isVoiceSOSActive;
  }, [isVoiceSOSActive]);
  useEffect(() => {
    emergencyCallActiveRef.current = isEmergencyCallVoiceActive;
  }, [isEmergencyCallVoiceActive]);

  useEffect(() => {
    setIsClient(true);
    setCustomMessage(t('home_client.custom_message.default_text'));
    setQuote(inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)]);
  }, [inspirationalQuotes, t]);


  const stopSiren = useCallback(() => {
    if (sirenRef.current) {
      sirenRef.current.osc.stop();
      sirenRef.current.lfo.stop();
      sirenRef.current.osc.dispose();
      sirenRef.current.lfo.dispose();
      sirenRef.current = null;
    }
    setIsSirenPlaying(false);
    // Ensure the main transport is stopped if not needed elsewhere
    if (Tone.Transport.state === 'started') {
        Tone.Transport.stop();
        Tone.Transport.cancel();
    }
  }, []);

  const startSiren = useCallback(async () => {
    if (sirenRef.current) return; // Already playing
    await Tone.start();
    
    // Ensure transport is started for LFO
    if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
    }

    const osc = new Tone.Oscillator(440, "sine").toDestination();
    const lfo = new Tone.LFO({
      type: "sine",
      min: 440,
      max: 1200,
      frequency: "2 Hz",
    }).connect(osc.frequency).start();
    
    osc.start();
    sirenRef.current = { osc, lfo };
    setIsSirenPlaying(true);
  }, []);

  const toggleSiren = useCallback(() => {
    if (isSirenPlaying) {
      stopSiren();
    } else {
      startSiren();
    }
  }, [isSirenPlaying, startSiren, stopSiren]);

  const handleSendSOS = useCallback((message, isPhoneCall = false) => {
    if (contacts.length === 0) {
      setAlertContent({
        title: t('home_client.permission_alerts.no_contacts_title'),
        description: t('home_client.permission_alerts.no_contacts_desc')
      });
      setIsAlertOpen(true);
      return;
    }
    const locationInfo = location ? `My live location is: https://www.google.com/maps?q=${location.latitude},${location.longitude}` : "My location is not available.";
    const fullMessage = `${message}\n\n${locationInfo}`;
    addAlert({
      message: fullMessage,
      contacts: contacts,
    });
    
    const body = encodeURIComponent(fullMessage);
    const primaryContactPhone = contacts[0]?.phone.replace(/[^+\d]/g, '');

    if (isPhoneCall) {
        if (!primaryContactPhone) {
            toast({
                variant: "destructive",
                title: t('home_client.toasts.no_phone_title'),
                description: t('home_client.toasts.no_phone_desc'),
            });
            return;
        }
        
        // Initiate phone call first
        window.location.href = `tel:${primaryContactPhone}`;
        toast({
            title: t('home_client.toasts.call_title'),
            description: t('home_client.toasts.call_desc', { name: contacts[0].name }),
        });
        
        // Then open WhatsApp after a short delay to allow the call prompt to appear
        const whatsappUri = `https://wa.me/${primaryContactPhone}?text=${body}`;
        setTimeout(() => {
            window.open(whatsappUri, '_blank');
        }, 1500); // 1.5-second delay

    } else {
        // Standard SOS: Send SMS and WhatsApp
        const phoneNumbers = contacts.map(c => c.phone.replace(/[^+\d]/g, '')).join(',');

        if (phoneNumbers) {
            const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
            const separator = isIOS ? '&' : '?';
            const smsUri = `sms:${phoneNumbers}${separator}body=${body}`;
            window.location.href = smsUri;
        }

        if (primaryContactPhone) {
            const whatsappUri = `https://wa.me/${primaryContactPhone}?text=${body}`;
            setTimeout(() => {
                window.open(whatsappUri, '_blank');
            }, 500);
        }

        if (phoneNumbers) {
            toast({
                title: t('home_client.toasts.sms_title'),
                description: t('home_client.toasts.sms_desc'),
            });
        } else {
             toast({
                variant: "destructive",
                title: t('home_client.toasts.no_phone_title'),
                description: t('home_client.toasts.no_phone_desc'),
            });
        }
    }
  }, [contacts, location, addAlert, toast, t]);
  
  const handleVoiceCommand = useCallback(async (transcript, commandType) => {
    const lowerTranscript = transcript.toLowerCase();
    const helpKeyword = t('home_client.voice_sos.keyword').toLowerCase();
    const callKeyword = t('home_client.voice_emergency_call.keyword').toLowerCase();

    if (commandType === 'sos' && lowerTranscript.includes(helpKeyword)) {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsVoiceSOSActive(false); // Turn off after successful activation
        handleSendSOS(t('home_client.voice_sos_message'));
        if (!isSirenPlaying) await startSiren();
    }
    
    if (commandType === 'call' && lowerTranscript.includes(callKeyword)) {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsEmergencyCallVoiceActive(false); // Turn off after successful activation
        handleSendSOS(t('home_client.emergency_call_message'), true); // true for phone call
    }
  }, [handleSendSOS, isSirenPlaying, startSiren, t]);

  const createVoiceListener = useCallback((
    isActive,
    setActiveState,
    activeRef,
    commandType,
    onSuccessToast,
    onFailureToast
  ) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: "destructive", title: t('home_client.toasts.voice_unsupported_title'), description: t('home_client.toasts.voice_unsupported_desc') });
      return;
    }

    if (isActive) {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // Prevent restart
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setActiveState(false);
    } else {
      commandTriggeredRef.current = false; // Reset the trigger flag
      if (recognitionRef.current) { // Stop any existing listener
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true; // Process results in real-time
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        if (commandTriggeredRef.current) return; // Do not process if command already triggered

         // Check all results, including interim ones, for the keyword
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript.trim();
            const lowerTranscript = transcript.toLowerCase();
            const helpKeyword = t('home_client.voice_sos.keyword').toLowerCase();
            const callKeyword = t('home_client.voice_emergency_call.keyword').toLowerCase();

            if (
                (commandType === 'sos' && lowerTranscript.includes(helpKeyword)) ||
                (commandType === 'call' && lowerTranscript.includes(callKeyword))
            ) {
                commandTriggeredRef.current = true; // Set flag to true
                handleVoiceCommand(transcript, commandType);
                break; // Stop checking once the command is found
            }
        }
      };
      
      recognition.onerror = (event) => {
        if (event.error === 'no-speech' || event.error === 'aborted') {
            return; 
        }
        if (event.error === 'network') {
          toast({ variant: "destructive", title: t('home_client.toasts.network_error_title'), description: t('home_client.toasts.network_error_desc') });
          return;
        }

        if (event.error === 'not-allowed') {
          setAlertContent({ title: t('home_client.permission_alerts.mic_denied_title'), description: t('home_client.permission_alerts.mic_denied_desc') });
          setIsAlertOpen(true);
        } else {
          console.error("Speech Recognition Error:", event.error);
          toast(onFailureToast);
        }
        setActiveState(false);
        if (recognitionRef.current) {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
          recognitionRef.current = null;
        }
      };

      recognition.onend = () => {
        // Only restart if the service was intentionally left active by the user.
        if (activeRef.current && recognitionRef.current && !commandTriggeredRef.current) {
          try { 
            recognitionRef.current.start();
          } catch (e) { 
            console.error("Could not restart speech recognition:", e);
            setActiveState(false); 
            recognitionRef.current = null;
          }
        }
      };

      recognition.start();
      setActiveState(true);
      toast(onSuccessToast);
    }
  }, [handleVoiceCommand, toast, t]);

  const handleToggleVoiceSOS = useCallback(() => createVoiceListener(
    isVoiceSOSActive, setIsVoiceSOSActive, voiceSosActiveRef, 'sos',
    { title: t('home_client.toasts.voice_on_title'), description: t('home_client.toasts.voice_on_desc') },
    { variant: "destructive", title: t('home_client.toasts.voice_error_title'), description: t('home_client.toasts.voice_error_desc') }
  ), [isVoiceSOSActive, createVoiceListener, voiceSosActiveRef, t]);

  const handleToggleEmergencyCallVoice = useCallback(() => createVoiceListener(
    isEmergencyCallVoiceActive, setIsEmergencyCallVoiceActive, emergencyCallActiveRef, 'call',
    { title: t('home_client.toasts.voice_call_on_title'), description: t('home_client.toasts.voice_call_on_desc') },
    { variant: "destructive", title: t('home_client.toasts.voice_call_error_title'), description: t('home_client.toasts.voice_call_error_desc') }
  ), [isEmergencyCallVoiceActive, createVoiceListener, emergencyCallActiveRef, t]);

  const [isShakeEnabled, setIsShakeEnabled] = useState(false);

  const handleShake = useCallback(() => {
    if (!isShakeEnabled) return;
    handleSendSOS(t('home_client.shake_sos_message'));
    if (!isSirenPlaying) {
      startSiren();
    }
  }, [isShakeEnabled, handleSendSOS, isSirenPlaying, startSiren, t]);

  const { requestPermission, permissionGranted } = useShakeDetector({ onShake: handleShake });

  const handleToggleShakeSwitch = async () => {
    if (isShakeEnabled) {
      setIsShakeEnabled(false);
      return;
    }
    let granted = permissionGranted;
    if (granted === null) {
      granted = await requestPermission();
    }
    if (granted) {
      setIsShakeEnabled(true);
      toast({
        title: t('home_client.toasts.shake_on_title'),
        description: t('home_client.toasts.shake_on_desc'),
      });
    } else {
      setIsShakeEnabled(false);
      setAlertContent({
        title: t('home_client.permission_alerts.motion_denied_title'),
        description: t('home_client.permission_alerts.motion_denied_desc')
      });
      setIsAlertOpen(true);
    }
  };
  
  const handleDisconnectWatch = () => {
    setIsWatchLinked(false);
    toast({
        title: t('home_client.watch_toasts.disconnected_title'),
        description: t('home_client.watch_toasts.disconnected_desc')
    });
  };

  useEffect(() => {
    let watchId;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          setError(null);
        },
        (err) => {
          setError(t('home_client.toasts.location_error_desc', { message: err.message }));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, }
      );
    } else {
      setError(t('home_client.toasts.location_unsupported_desc'));
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      stopSiren();
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, [stopSiren, t]);

  useEffect(() => {
    if (!isLinkWatchDialogOpen) return;
    import('html5-qrcode')
      .then(({ Html5Qrcode }) => {
        if (!qrScannerRef.current) {
          const scanner = new Html5Qrcode('qr-reader-container');
          qrScannerRef.current = scanner;
          const onScanSuccess = (decodedText, decodedResult) => {
            if (scanner.isScanning) {
              scanner.stop().then(() => {
                setIsWatchLinked(true);
                setIsLinkWatchDialogOpen(false);
                toast({ title: t('home_client.watch_toasts.linked_title'), description: t('home_client.watch_toasts.linked_desc') });
              }).catch(err => console.error("Error stopping scanner after success:", err));
            }
          };
          const onScanFailure = (error) => {};
          scanner.start({ facingMode: "user" }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, onScanFailure)
            .catch(err => {
              console.error("Unable to start QR scanner", err);
              toast({ variant: "destructive", title: t('home_client.watch_toasts.camera_error_title'), description: t('home_client.watch_toasts.camera_error_desc') });
              setIsLinkWatchDialogOpen(false);
            });
        }
      })
      .catch(err => {
        console.error("Failed to load html5-qrcode library", err);
        toast({ variant: "destructive", title: t('home_client.watch_toasts.scanner_error_title'), description: t('home_client.watch_toasts.scanner_error_desc') });
        setIsLinkWatchDialogOpen(false);
      });
    return () => {
      if (qrScannerRef.current && qrScannerRef.current.isScanning) {
        qrScannerRef.current.stop().catch(err => console.warn("QR scanner cleanup stop error (ignorable):", err));
      }
      qrScannerRef.current = null;
    };
  }, [isLinkWatchDialogOpen, toast, t]);

  return (
    <div className="relative min-h-screen bg-transparent">
      <div 
        className="fixed inset-0 -z-10 bg-cover bg-center blur-sm brightness-75"
        style={{ backgroundImage: "url('/background.jpg')" }}
      >
      </div>
      <div className="container mx-auto px-4 pb-8">
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="relative p-4 bg-card/80 backdrop-blur-xl rounded-full shadow-2xl border border-border/50">
              <Shield className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h2 
            className="text-4xl md:text-5xl font-bold font-headline text-foreground flex items-center justify-center gap-4"
          >
            {t('home_page.title')}
            <Siren className="h-12 w-12 text-primary" />
          </h2>
          <p 
           className="text-foreground font-semibold text-lg leading-relaxed mt-4"
          >
            {t('home_page.subtitle')}
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl rounded-3xl p-6 hover-lift hover-glow">
              <div className="relative">
                {!isClient ? (
                  <>
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/4 ml-auto" />
                  </>
                ) : (
                  <>
                    <Sparkles className="absolute -top-3 -left-3 h-6 w-6 text-primary/80 animate-pulse" />
                    <blockquote className="text-xl font-medium italic text-foreground/90 mb-4 leading-relaxed text-center">
                      &quot;{quote.text}&quot;
                    </blockquote>
                    <cite className="block text-right text-primary font-semibold">— {quote.author}</cite>
                    <Heart className="absolute -bottom-3 -right-3 h-6 w-6 text-primary/80 opacity-50" />
                  </>
                )}
              </div>
          </Card>
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <Card className="bg-white backdrop-blur-xl border-border/50 p-2 shadow-lg">
              <CardContent className="flex items-center justify-between p-4" style={{ transform: 'translateZ(0)' }}>
                <div className="flex items-center space-x-4">
                  <Mic className="h-6 w-6 text-primary" />
                  <div>
                    <Label htmlFor="voice-detector" className="font-semibold text-base text-foreground">{t('home_client.voice_sos.label')}</Label>
                    <p className="text-xs text-muted-foreground">{t('home_client.voice_sos.description')}</p>
                  </div>
                </div>
                <Switch
                  id="voice-detector"
                  checked={isVoiceSOSActive}
                  onCheckedChange={handleToggleVoiceSOS}
                  aria-label="Toggle voice activated SOS"
                />
              </CardContent>
            </Card>
            
            <Card className="bg-white backdrop-blur-xl border-border/50 p-2 shadow-lg" style={{ transform: 'translateZ(0)' }}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <PhoneCall className="h-6 w-6 text-primary" />
                  <div>
                    <Label htmlFor="voice-emergency-call" className="font-semibold text-base text-foreground">{t('home_client.voice_emergency_call.label')}</Label>
                    <p className="text-xs text-muted-foreground">{t('home_client.voice_emergency_call.description')}</p>
                  </div>
                </div>
                <Switch
                  id="voice-emergency-call"
                  checked={isEmergencyCallVoiceActive}
                  onCheckedChange={handleToggleEmergencyCallVoice}
                  aria-label="Toggle voice emergency call"
                />
              </CardContent>
            </Card>

            <Card className="bg-white backdrop-blur-xl border-border/50 p-2 shadow-lg" style={{ transform: 'translateZ(0)' }}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <Zap className="h-6 w-6 text-primary" />
                  <div>
                    <Label htmlFor="shake-detector" className="font-semibold text-base text-foreground">{t('home_client.shake_sos.label')}</Label>
                    <p className="text-xs text-muted-foreground">{t('home_client.shake_sos.description')}</p>
                  </div>
                </div>
                <Switch
                  id="shake-detector"
                  checked={isShakeEnabled}
                  onCheckedChange={handleToggleShakeSwitch}
                  aria-label="Toggle shake to activate SOS"
                />
              </CardContent>
            </Card>

            <Card className="bg-white backdrop-blur-xl border-border/50 p-2 shadow-lg" style={{ transform: 'translateZ(0)' }}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <Watch className="h-6 w-6 text-primary" />
                  <div>
                    <Label htmlFor="smartwatch-link" className="font-semibold text-base text-foreground">{t('home_client.watch_link.label')}</Label>
                    <p className="text-xs text-muted-foreground">{t('home_client.watch_link.description')}</p>
                  </div>
                </div>
                {isWatchLinked ? (
                  <Button variant="outline" size="sm" onClick={handleDisconnectWatch}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    {t('home_client.watch_link.linked')}
                  </Button>
                ) : (
                  <Dialog open={isLinkWatchDialogOpen} onOpenChange={setIsLinkWatchDialogOpen}>
                    <DialogTrigger asChild>
                      <Button id="smartwatch-link" variant="outline" size="sm">
                        {t('common.connect')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('home_client.watch_dialog.title')}</DialogTitle>
                        <DialogDescription>
                          {t('home_client.watch_dialog.description')}
                        </DialogDescription>
                      </DialogHeader>
                      <div id="qr-reader-container" className="w-full rounded-md border aspect-square" />
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="secondary">
                            {t('common.cancel')}
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white backdrop-blur-xl border-border/50 p-2 shadow-lg md:col-span-2" style={{ transform: 'translateZ(0)' }}>
              <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                      <Phone className="h-6 w-6 text-primary" />
                      <div>
                          <Label htmlFor="fake-call-button" className="font-semibold text-base text-foreground">{t('home_client.fake_call.label')}</Label>
                          <p className="text-xs text-muted-foreground">{t('home_client.fake_call.description')}</p>
                      </div>
                  </div>
                  <div className="w-auto">
                      <Button id="fake-call-button" variant="outline" size="sm" onClick={() => setIsFakeCallActive(true)}>
                          {t('home_client.fake_call.start_button')}
                      </Button>
                  </div>
              </CardContent>
            </Card>
          </div>

          <Card className="w-full shadow-2xl rounded-2xl bg-card/80 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold font-headline flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                {t('home_client.custom_message.title')}
              </CardTitle>
              <CardDescription>{t('home_client.custom_message.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={t('home_client.custom_message.placeholder')}
                rows={4}
                className="bg-background/50"
              />
            </CardContent>
            <CardFooter>
              <Button className="w-full h-12" variant="secondary" onClick={() => handleSendSOS(customMessage)}>
                <Send className="mr-2 h-4 w-4" />
                {t('home_client.custom_message.button')}
              </Button>
            </CardFooter>
          </Card>
            
          {/* Bottom Buttons */}
          <div className="space-y-4 pt-4 flex flex-col items-center">
            <SirenButton isPlaying={isSirenPlaying} onToggle={toggleSiren} />
            <Button
              className="w-full max-w-sm h-16 text-xl font-bold bg-gradient-to-r from-primary to-destructive text-primary-foreground shadow-glow-lg"
              onClick={() => handleSendSOS(t('home_client.sos_message'))}
            >
              <ShieldAlert className="mr-3 h-8 w-8" />
              {t('home_client.one_tap_sos')}
            </Button>
          </div>

          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{alertContent.title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {alertContent.description}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction>{t('common.ok')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {isFakeCallActive && <FakeCallScreen onEndCall={() => setIsFakeCallActive(false)} />}
      </div>
    </div>
  );
}
