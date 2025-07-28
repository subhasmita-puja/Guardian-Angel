
"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSafetyZones } from '@/hooks/use-safety-zones';
import { useContacts } from '@/hooks/use-contacts';
import { useAlerts } from '@/hooks/use-alerts';
import { Map, MapPin, Bus, Search, ThumbsUp, ThumbsDown, Meh, Loader2, Info, Star, Bot, User, Send, Paperclip, Camera, Video, Circle, StopCircle, Download, Film, Image as ImageIcon, ShieldAlert, AlertTriangle, FileText, Sparkles, XCircle } from 'lucide-react';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { reportCrime } from '@/ai/flows/report-crime-flow';
import 'leaflet/dist/leaflet.css';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/context/language-context';
import { Skeleton } from '@/components/ui/skeleton';

const LiveMap = dynamic(
  () => import('@/components/live-map').then((mod) => mod.LiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  }
);

export default function SafeMapPage() {
  const { t } = useTranslation();
  const inspirationalQuotes = t('safemap_page.inspirational_quotes');
  const [quote, setQuote] = useState(inspirationalQuotes[0]);
  const [isClient, setIsClient] = useState(false);

  const { toast } = useToast();
  const { zones, addZone } = useSafetyZones();
  const { contacts } = useContacts();
  const { addAlert } = useAlerts();
  
  // Location state
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Map interaction state
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);
  
  // Crime Report State
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState({ photo: null, video: null });

  // Camera & Evidence State
  const [cameraMode, setCameraMode] = useState('idle'); // 'idle', 'photo', 'recording', 'photo_review', 'video_review'
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [recordedVideoDataUrl, setRecordedVideoDataUrl] = useState(null);
  const [capturedPhotoDataUrl, setCapturedPhotoDataUrl] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);

  // Refs
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const photoCanvasRef = useRef(null);
  const fileInputPhotoRef = useRef(null);
  const fileInputVideoRef = useRef(null);
  
  // Set initial chat message after component mounts and t is available
  useEffect(() => {
    setIsClient(true);
    setChatHistory([{ role: 'model', content: t('safemap_client.crime_report_card.initial_ai_message')}]);
    setQuote(inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)]);
  }, [t, inspirationalQuotes]);


  const stopCameraStream = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }
  };

  // Effect for Geolocation
  useEffect(() => {
    let watchId;
    if ('geolocation' in navigator) {
      // Use watchPosition for continuous, more accurate location updates.
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy });
          setLocationError(null);
        },
        (err) => { setLocationError(t('safemap_client.location.error_message', { message: err.message })); },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationError(t('safemap_client.location.unsupported_message'));
    }
    
    // Cleanup function
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      stopCameraStream();
      if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]); // Only run once on mount

  const handleMapClick = (latlng) => {
    setClickedCoords(latlng);
    setIsRatingDialogOpen(true);
  };

  const handleRateArea = (rating) => {
    if (clickedCoords) {
      addZone({ latlng: clickedCoords, rating: rating, timestamp: new Date().toISOString() });
      toast({ 
        title: t('safemap_client.rate_toast.title'), 
        description: t('safemap_client.rate_toast.description', { rating: t(`safemap_client.rate_dialog.${rating}`) }) 
      });
    }
    setIsRatingDialogOpen(false);
    setClickedCoords(null);
  };

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setAttachments(prev => ({ ...prev, [type]: { name: file.name, dataUri: e.target.result } }));
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset input
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = { role: 'user', content: userInput };
    const currentAttachments = { ...attachments };

    // This is the combined history + new message approach
    const newChatHistoryWithUserMessage = [...chatHistory, userMessage];

    setChatHistory(newChatHistoryWithUserMessage);
    setUserInput('');
    setAttachments({ photo: null, video: null });
    setIsSending(true);

    try {
      const response = await reportCrime({
        chatHistory: newChatHistoryWithUserMessage,
        location: location ? { latitude: location.latitude, longitude: location.longitude } : undefined,
        photoDataUri: currentAttachments.photo?.dataUri,
        videoDataUri: currentAttachments.video?.dataUri,
      });
      setChatHistory(prev => [...prev, { role: 'model', content: response.response }]);
    } catch (error) {
      console.error("Error reporting crime:", error);
      toast({ variant: 'destructive', title: t('common.error'), description: error.message });
      setChatHistory(prev => [...prev, { role: 'model', content: t('safemap_client.crime_report_card.ai_error_message') }]);
    } finally {
      setIsSending(false);
    }
  };

  const startCamera = async (mode) => {
    stopCameraStream(); // Ensure previous stream is stopped
    setCameraMode(mode);

    if (!navigator.mediaDevices?.getUserMedia) {
        toast({ variant: 'destructive', title: t('safemap_client.camera.unsupported_title'), description: t('safemap_client.camera.unsupported_desc') });
        setCameraMode('idle');
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: mode === 'recording',
            video: { facingMode: "user" } // Explicitly request the user-facing camera
        });
        streamRef.current = stream;
        setHasCameraPermission(true);
        
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }

        if (mode === 'recording') {
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            recordedChunksRef.current = [];
            
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) recordedChunksRef.current.push(event.data);
            };
            
            recorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                setRecordedVideoUrl(url);

                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    setRecordedVideoDataUrl(reader.result);
                }
                setCameraMode('video_review');
                stopCameraStream();
            };
            recorder.start();
        }
    } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setCameraMode('idle');
        toast({ variant: 'destructive', title: t('safemap_client.camera.denied_title'), description: t('safemap_client.camera.denied_desc') });
    }
  };
  
  const handleCancelCamera = () => {
    stopCameraStream();
    setCameraMode('idle');
    setCapturedPhotoDataUrl(null);
    setRecordedVideoUrl(null);
    setRecordedVideoDataUrl(null);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };
  
  const handleSnapPhoto = () => {
    if (videoRef.current && photoCanvasRef.current) {
        const video = videoRef.current;
        const canvas = photoCanvasRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedPhotoDataUrl(dataUrl);

        stopCameraStream();
        setCameraMode('photo_review');
    }
  };

  const handleAttachCapturedPhoto = () => {
    if (capturedPhotoDataUrl) {
        setAttachments(prev => ({ ...prev, photo: { name: `capture-${Date.now()}.jpg`, dataUri: capturedPhotoDataUrl } }));
        setCapturedPhotoDataUrl(null);
        setCameraMode('idle');
        toast({ title: t('safemap_client.evidence_toasts.photo_attached_title'), description: t('safemap_client.evidence_toasts.photo_attached_desc') });
    }
  };
  
  const handleAttachRecordedVideo = () => {
    if (recordedVideoDataUrl) {
        setAttachments(prev => ({ ...prev, video: { name: `recording-${Date.now()}.webm`, dataUri: recordedVideoDataUrl } }));
        setRecordedVideoUrl(null);
        setRecordedVideoDataUrl(null);
        setCameraMode('idle');
        toast({ title: t('safemap_client.evidence_toasts.video_attached_title'), description: t('safemap_client.evidence_toasts.video_attached_desc') });
    }
  };

  const handleRetakePhoto = () => {
    setCapturedPhotoDataUrl(null);
    startCamera('photo');
  };
  
  const handleRetakeVideo = () => {
    setRecordedVideoUrl(null);
    setRecordedVideoDataUrl(null);
    startCamera('recording');
  };

  const downloadVideo = () => {
    if (!recordedVideoUrl) return;
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = `guardian-angel-evidence-${new Date().toISOString()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const downloadPhoto = () => {
    if (!capturedPhotoDataUrl) return;
    const a = document.createElement('a');
    a.href = capturedPhotoDataUrl;
    a.download = `guardian-angel-capture-${new Date().toISOString()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleSendEvidenceToContacts = () => {
    if (contacts.length === 0) {
      toast({
        variant: "destructive",
        title: t('safemap_client.emergency_alert.no_contacts_title'),
        description: t('safemap_client.emergency_alert.no_contacts_desc'),
      });
      return;
    }

    let evidenceMessage = t('safemap_client.emergency_alert.message');
    if (attachments.photo && attachments.video) {
        evidenceMessage = t('safemap_client.emergency_alert.both_message');
    } else if (attachments.photo) {
        evidenceMessage = t('safemap_client.emergency_alert.photo_message');
    } else if (attachments.video) {
        evidenceMessage = t('safemap_client.emergency_alert.video_message');
    }
    
    const locationInfo = location ? `My live location is: https://www.google.com/maps?q=${location.latitude},${location.longitude}` : t('safemap_client.location.not_available');
    const fullMessage = t('safemap_client.emergency_alert.full_message', { evidenceMessage, locationInfo });
    
    addAlert({
      message: fullMessage,
      contacts: contacts,
    });

    const phoneNumbers = contacts.map(c => c.phone.replace(/[^+\d]/g, '')).join(',');

    if (phoneNumbers) {
      const body = encodeURIComponent(fullMessage);
      const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
      const separator = isIOS ? '&' : '?';
      const smsUri = `sms:${phoneNumbers}${separator}body=${body}`;
      
      window.location.href = smsUri;
      
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
  };


  return (
    <div className="container mx-auto px-4 pb-8">
       <div className="fixed inset-0 -z-10">
  <img
    src="/poster.avif"
    alt="Background"
    className="w-full h-full object-cover blur-sm brightness-75"
  />
</div>
      <div className="text-center mb-12">
        <div className="relative inline-block mb-6 hover-lift">
          <div className="relative p-4 bg-card/80 backdrop-blur-xl rounded-full shadow-2xl border border-border/50">
            <MapPin className="h-16 w-16 text-primary" />
          </div>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold font-headline text-foreground flex items-center justify-center gap-4">
          {t('safemap_page.title')}
        </h2>
        <p className="text-foreground font-semibold text-lg leading-relaxed mt-4">{t('safemap_page.subtitle')}</p>
        
        <div className="max-w-2xl mx-auto mt-8">
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
                    <Star className="absolute -bottom-3 -right-3 h-6 w-6 text-primary/80 opacity-50" />
                  </>
                )}
              </div>
            </Card>
        </div>
      </div>
      
      <div className="space-y-8">
        <Card className="bg-card/80 backdrop-blur-xl border-border/50 hover-lift col-span-2">
            <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center">
                    <Map className="mr-3 h-7 w-7 text-primary" />
                    {t('safemap_client.map_card.title')}
                </CardTitle>
                <CardDescription>{t('safemap_client.map_card.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center shadow-inner">
                    {location ? (
                      <LiveMap location={location} accuracy={location.accuracy} safetyZones={zones} onMapClick={handleMapClick} t={t} />
                    ) : (
                      <div className="text-center text-muted-foreground p-4">
                        {locationError ? (
                            <>
                                <p className="text-sm text-destructive">{locationError}</p>
                                <p className="text-xs text-muted-foreground mt-1">{t('safemap_client.location.enable_services')}</p>
                            </>
                        ) : (
                            <>
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                <p>{t('safemap_client.location.waiting')}</p>
                            </>
                        )}
                      </div>
                    )}
                </div>
                {location && (
                    <div className="space-y-2 pt-2">
                        <div className="text-center text-xs text-muted-foreground">
                            <p>{t('safemap_client.location.lat')}: {location.latitude.toFixed(6)}, {t('safemap_client.location.lng')}: {location.longitude.toFixed(6)}</p>
                            {location.accuracy && <p>{t('safemap_client.location.accuracy', { accuracy: location.accuracy.toFixed(0) })}</p>}
                        </div>
                        {location.accuracy > 100 && (
                        <Alert variant="destructive" className="mt-2 text-left">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>{t('safemap_client.location.low_accuracy_title')}</AlertTitle>
                            <AlertDescription>
                                {t('safemap_client.location.low_accuracy_desc')}
                            </AlertDescription>
                        </Alert>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center"><Bot className="mr-2 h-6 w-6"/>{t('safemap_client.crime_report_card.ai_assistant_title')}</CardTitle>
                    <CardDescription>{t('safemap_client.crime_report_card.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow flex flex-col">
                  <div className="h-64 overflow-y-auto rounded-md border bg-muted/50 p-4 space-y-4 flex-grow">
                    {chatHistory.map((msg, index) => (
                      <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <Avatar className="w-8 h-8"><AvatarFallback><Bot /></AvatarFallback></Avatar>}
                        <div className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {msg.role === 'user' && <Avatar className="w-8 h-8"><AvatarFallback><User /></AvatarFallback></Avatar>}
                      </div>
                    ))}
                    {isSending && <div className="flex justify-start gap-3"><Avatar className="w-8 h-8"><AvatarFallback><Bot /></AvatarFallback></Avatar><div className="bg-background rounded-lg p-2"><Loader2 className="animate-spin" /></div></div>}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-2">
                      {attachments.photo && <div className="flex items-center gap-1 bg-secondary p-1 rounded-md"><ImageIcon className="h-4 w-4" /><span>{attachments.photo.name}</span></div>}
                      {attachments.video && <div className="flex items-center gap-1 bg-secondary p-1 rounded-md"><Film className="h-4 w-4" /><span>{attachments.video.name}</span></div>}
                  </div>

                  <form onSubmit={handleSendMessage} className="w-full flex items-start gap-2 mt-auto">
                      <Textarea placeholder={t('safemap_client.crime_report_card.ai_placeholder')} value={userInput} onChange={(e) => setUserInput(e.target.value)} rows={2} className="pr-20" disabled={isSending}/>
                      <Button type="submit" disabled={isSending || !userInput.trim()} size="icon" className="h-full">
                        {isSending ? <Loader2 className="animate-spin"/> : <Send />}
                        <span className="sr-only">{t('common.send')}</span>
                      </Button>
                  </form>
                </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center"><Camera className="mr-2 h-6 w-6"/>{t('safemap_client.crime_report_card.evidence_title')}</CardTitle>
                    <CardDescription>{t('safemap_client.crime_report_card.emergency_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex-grow flex flex-col justify-between">
                    <div className="aspect-video bg-black rounded-md overflow-hidden flex items-center justify-center relative">
                        <canvas ref={photoCanvasRef} className="hidden" />
                        <video 
                            ref={videoRef} 
                            src={cameraMode === 'video_review' ? recordedVideoUrl : undefined}
                            className="w-full h-full object-cover" 
                            autoPlay={cameraMode !== 'video_review'}
                            muted={cameraMode !== 'video_review'}
                            playsInline
                            controls={cameraMode === 'video_review'}
                            loop={cameraMode === 'video_review'}
                        />
                         {cameraMode === 'photo_review' && capturedPhotoDataUrl && (
                             <img src={capturedPhotoDataUrl} alt="Captured" className="w-full h-full object-contain" />
                         )}
                        {hasCameraPermission === false && cameraMode !== 'idle' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4">
                                <Alert variant="destructive">
                                    <Camera className="h-4 w-4"/>
                                    <AlertTitle>{t('safemap_client.camera.required_title')}</AlertTitle>
                                    <AlertDescription>{t('safemap_client.camera.required_desc')}</AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                        {cameraMode === 'idle' && (
                            <>
                                <Button onClick={() => startCamera('recording')}><Circle className="mr-2 h-4 w-4 fill-red-500 text-red-500" /> {t('safemap_client.crime_report_card.record_video')}</Button>
                                <Button onClick={() => startCamera('photo')} variant="outline"><Camera className="mr-2 h-4 w-4" /> {t('safemap_client.crime_report_card.take_picture')}</Button>
                                <Button variant="ghost" size="sm" onClick={() => fileInputPhotoRef.current?.click()}><Paperclip className="mr-2 h-4 w-4"/>{t('safemap_client.crime_report_card.attach_photo')}</Button>
                                <Button variant="ghost" size="sm" onClick={() => fileInputVideoRef.current?.click()}><Film className="mr-2 h-4 w-4"/>{t('safemap_client.crime_report_card.attach_video')}</Button>
                            </>
                        )}
                        
                        {cameraMode === 'recording' && (
                          <div className="flex items-center gap-2">
                            <Button onClick={stopRecording} variant="destructive"><StopCircle className="mr-2 h-4 w-4" /> {t('safemap_client.crime_report_card.stop_recording')}</Button>
                            <Button onClick={handleCancelCamera} variant="ghost"><XCircle className="mr-2 h-4 w-4" />{t('common.cancel')}</Button>
                          </div>
                        )}

                        {cameraMode === 'photo' && (
                          <div className="flex items-center gap-2">
                            <Button onClick={handleSnapPhoto}><Camera className="mr-2 h-4 w-4" /> {t('safemap_client.crime_report_card.snap_photo')}</Button>
                            <Button onClick={handleCancelCamera} variant="ghost"><XCircle className="mr-2 h-4 w-4" />{t('common.cancel')}</Button>
                          </div>
                        )}
                        
                        {cameraMode === 'photo_review' && (
                          <div className="flex flex-wrap items-center justify-center gap-2">
                              <Button onClick={handleAttachCapturedPhoto}><Paperclip className="mr-2 h-4 w-4" /> {t('safemap_client.crime_report_card.attach_to_report')}</Button>
                              <Button onClick={downloadPhoto} variant="outline"><Download className="mr-2 h-4 w-4" /> {t('common.download')}</Button>
                              <Button onClick={handleRetakePhoto} variant="outline">{t('common.retake')}</Button>
                          </div>
                        )}

                        {cameraMode === 'video_review' && (
                          <div className="flex flex-wrap items-center justify-center gap-2">
                              <Button onClick={handleAttachRecordedVideo}><Paperclip className="mr-2 h-4 w-4" /> {t('safemap_client.crime_report_card.attach_to_report')}</Button>
                              <Button onClick={downloadVideo} variant="outline"><Download className="mr-2 h-4 w-4" /> {t('common.download')}</Button>
                              <Button onClick={handleRetakeVideo} variant="outline">{t('safemap_client.crime_report_card.record_again')}</Button>
                          </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 mt-auto">
                    <Button variant="destructive" className="w-full h-12 text-base" onClick={handleSendEvidenceToContacts} disabled={!attachments.photo && !attachments.video}>
                        <ShieldAlert className="mr-3 h-5 w-5" />
                        {t('safemap_client.crime_report_card.emergency_button')}
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>

      <AlertDialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('safemap_client.rate_dialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('safemap_client.rate_dialog.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2 flex-col sm:flex-row">
            <Button onClick={() => handleRateArea('safe')} className="bg-green-600 hover:bg-green-700 text-white"><ThumbsUp className="mr-2" /> {t('safemap_client.rate_dialog.safe')}</Button>
            <Button onClick={() => handleRateArea('neutral')} className="bg-amber-500 hover:bg-amber-600 text-white"><Meh className="mr-2" /> {t('safemap_client.rate_dialog.neutral')}</Button>
            <Button onClick={() => handleRateArea('risky')} variant="destructive"><ThumbsDown className="mr-2" /> {t('safemap_client.rate_dialog.risky')}</Button>
            <AlertDialogCancel className="w-full sm:w-auto mt-2 sm:mt-0">{t('common.cancel')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <input type="file" accept="image/*" ref={fileInputPhotoRef} onChange={(e) => handleFileChange(e, 'photo')} className="hidden" />
      <input type="file" accept="video/*" ref={fileInputVideoRef} onChange={(e) => handleFileChange(e, 'video')} className="hidden" />
    </div>
  );
}
