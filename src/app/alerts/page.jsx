
"use client";

import React, { useState, useEffect } from 'react';
import { useAlerts } from '@/hooks/use-alerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { History, MessageSquare, Clock, MapPin, Users, Shield, Bell, Trash2, AlertCircle, Star, Quote, Sparkles, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/context/language-context';

export default function AlertsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { alerts, clearAlerts } = useAlerts();
  
  const inspirationalQuotes = t('alerts_page.inspirational_quotes');
  const [currentQuote, setCurrentQuote] = useState(inspirationalQuotes[0]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
    setCurrentQuote(randomQuote);
  }, [inspirationalQuotes]);

  const handleClearAlerts = () => {
    clearAlerts();
    toast({
      title: t('alerts_page.clear_toast.title'),
      description: t('alerts_page.clear_toast.description'),
    });
  };

  return (
    <div className="container mx-auto flex-1 px-3 sm:px-4 pb-8">
      <div className="fixed inset-0 -z-10">
       <img
    src="/alerts.jpg"
    alt="Background"
    className="w-full h-full object-cover blur-sm brightness-75"
  />
</div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6 hover-lift">
            <div className="relative p-4 bg-card/80 backdrop-blur-xl rounded-full shadow-2xl border border-border/50">
              <History className="h-16 w-16 text-destructive animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-bold font-headline text-foreground mb-4 hover-lift">
            {t('alerts_page.title')}
          </h1>
          <p className="text-foreground font-semibold text-lg leading-relaxed mb-6">{t('alerts_page.subtitle')}</p>
          <div className="flex items-center justify-center space-x-3">
            <Shield className="h-6 w-6 text-destructive animate-pulse" />
            <span className="text-destructive font-semibold text-base bg-slate-100">{t('alerts_page.banner_text')}</span>
            <History className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>

        <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl hover-lift hover-glow">
            <CardContent className="p-8 text-center">
                <div className="relative">
                  {!isClient ? (
                    <>
                      <Skeleton className="h-6 w-3/4 mb-4 mx-auto" />
                      <Skeleton className="h-4 w-1/4 ml-auto" />
                    </>
                  ) : (
                    <>
                      <Quote className="absolute -top-4 -left-4 h-12 w-12 text-destructive/30 transform -rotate-12" />
                      <blockquote className="text-2xl font-headline italic text-foreground mb-4 leading-relaxed">
                          &quot;{currentQuote.text}&quot;
                      </blockquote>
                      <cite className="text-destructive font-semibold text-base">— {currentQuote.author}</cite>
                      <Sparkles className="absolute -bottom-4 -right-4 h-8 w-8 text-primary/50 animate-pulse" />
                    </>
                  )}
                </div>
            </CardContent>
        </Card>

        {alerts.length > 0 && (
          <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl hover-lift hover-glow">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-yellow-100 to-red-100 rounded-2xl shadow-md">
                    <Trash2 className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{t('alerts_page.manage_history.title')}</h3>
                    <p className="text-muted-foreground text-sm">{t('alerts_page.manage_history.description')}</p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleClearAlerts}
                  className="w-full sm:w-auto px-6 py-3 hover-lift hover-glow text-base"
                >
                  <Trash2 className="mr-2 h-5 w-5" />
                  <span>{t('alerts_page.manage_history.button')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {alerts.length === 0 ? (
          <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl hover-lift hover-glow">
            <CardContent className="text-center py-16 px-4">
              <div className="relative inline-block mb-8 hover-lift">
                <div className="relative p-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl shadow-lg">
                  <Bell className="h-16 w-16 text-primary mx-auto" />
                  <Shield className="absolute -top-2 -right-2 h-8 w-8 text-accent" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{t('alerts_page.no_alerts.title')}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                {t('alerts_page.no_alerts.description')}
              </p>
              <div className="flex items-center justify-center space-x-2 text-primary">
                <Heart className="h-5 w-5" />
                <span className="font-medium text-base">{t('alerts_page.no_alerts.banner')}</span>
                <Star className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {alerts.map((alert, index) => (
              <Card 
                key={alert.id} 
                className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl hover-lift hover-glow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-destructive"/>
                                {t('alerts_page.alert_card.title')}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <Clock className="h-4 w-4" />
                                {format(new Date(alert.timestamp), "PPP p")}
                            </p>
                        </div>
                        <Badge variant="destructive">{t('alerts_page.alert_card.badge')}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Users className="h-4 w-4 text-primary"/>{t('alerts_page.alert_card.sent_to')}</h4>
                        <ul className="text-sm list-disc pl-5 bg-background p-3 rounded-md border">
                          {alert.contacts.map(c => <li key={c.id}><strong>{c.name}</strong> ({c.phone})</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><MessageSquare className="h-4 w-4"/>{t('alerts_page.alert_card.message_sent')}</h4>
                        <div className="p-4 bg-background rounded-md text-foreground whitespace-pre-wrap text-sm border">
                            {alert.message}
                        </div>
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl hover-lift hover-glow">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">{t('alerts_page.stats.title')}</h3>
              <p className="text-muted-foreground text-base">{t('alerts_page.stats.subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div className="space-y-2 hover-lift">
                <div className="text-4xl font-bold text-green-500">{alerts.length}</div>
                <div className="text-muted-foreground font-medium text-sm">{t('alerts_page.stats.total_alerts')}</div>
              </div>
              <div className="space-y-2 hover-lift">
                <div className="text-4xl font-bold text-primary">
                  {alerts.reduce((total, alert) => total + (alert.contacts?.length || 0), 0)}
                </div>
                <div className="text-muted-foreground font-medium text-sm">{t('alerts_page.stats.people_notified')}</div>
              </div>
              <div className="space-y-2 hover-lift">
                <div className="text-4xl font-bold text-accent-foreground">100%</div>
                <div className="text-muted-foreground font-medium text-sm">{t('alerts_page.stats.safety_priority')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
