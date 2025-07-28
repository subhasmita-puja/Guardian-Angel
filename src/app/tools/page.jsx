
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Shield, ShieldQuestion, ShoppingBag, PlayCircle, ExternalLink, BookOpen, Sparkles, Heart, Wrench } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from '@/context/language-context';

export default function ToolsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const inspirationalQuote = t('tools_page.quote');

const safetyTips = t('tools_client.safety_tips.tips');

const tutorialVideos = [
  {
    title: "Top 5 Self-Defense Moves",
    description: "Master simple and effective techniques to protect yourself.",
    duration: "9:12",
    difficulty: "Beginner",
    instructor: "Urban Survivalist",
    videoId: "JGTTFlp0RLk",
    thumbnail: "https://img.youtube.com/vi/JGTTFlp0RLk/maxresdefault.jpg"
  },
  {
    title: "Self-Defense for Women: Escape Grabs",
    description: "Learn how to escape wrist and shoulder grabs with ease.",
    duration: "7:48",
    difficulty: "Intermediate",
    instructor: "Women's Safety Trainer",
    videoId: "BUg0zlNcxFY",
    thumbnail: "https://img.youtube.com/vi/BUg0zlNcxFY/maxresdefault.jpg"
  },
  {
  title: "Beginner Self-Defense Techniques for Everyone",
  description: "Simple and realistic self-defense moves anyone can learn.",
  duration: "10:10",
  difficulty: "Beginner",
  instructor: "Women’s Self Defense",
  videoId: "KVpxP3ZZtAc",
  thumbnail: "https://img.youtube.com/vi/KVpxP3ZZtAc/maxresdefault.jpg"
},
{
  title: "Self-Defense Moves to Escape Dangerous Situations",
  description: "Learn practical and effective ways to escape real threats.",
  duration: "8:15",
  difficulty: "All Levels",
  instructor: "Self Defense Coach",
  videoId: "wb2oh2skrHA",
  thumbnail: "https://img.youtube.com/vi/wb2oh2skrHA/maxresdefault.jpg"
}, 
 {
    title: "Tactical Pen for Self-Defense",
    description: "Practical guide to using a tactical pen for personal safety.",
    duration: "6:40",
    difficulty: "Intermediate",
    instructor: "Tactical Coach",
    videoId: "CjQa0QTyN-k",
    thumbnail: "https://img.youtube.com/vi/CjQa0QTyN-k/maxresdefault.jpg"
  },
 {
    title: "How to Use Pepper Spray",
    description: "A clear 4-step demonstration on using pepper spray safely.",
    duration: "5:55",
    difficulty: "Beginner",
    instructor: "Safety Explained",
    videoId: "IxaXz_7OalM",
    thumbnail: "https://img.youtube.com/vi/IxaXz_7OalM/maxresdefault.jpg"
  }
];

 const safetyImages = [
  "https://i.ytimg.com/vi/4hIMWCjIODk/maxresdefault.jpg", // Surroundings
  "https://image.slidesharecdn.com/womensafety-210527171715/85/Women-safety-2-320.jpg", // Share Plans
  "https://img.freepik.com/premium-photo/successful-women-have-attained-peaks-personal-growth-development-woman-top-mountain-with-arms-open-welcoming-new-day-with-sunrise-success-generative-ai-illustrator_993599-4634.jpg", // Walk Confidently
  "https://quotefancy.com/media/wallpaper/800x450/7276518-Nat-Chelloni-Quote-Always-trust-your-gut-feeling-It-never-lies.jpg", // Trust Gut
  "https://static.vecteezy.com/system/resources/previews/007/783/990/non_2x/woman-locating-taxi-route-from-digital-map-vector.jpg", // Emergency Plan
  "https://zforex.com/assets/zforex/upload/images/m/exit-strategies-trading-92.jpg"  // Exit Strategy
];


const articleLinks = [
  {
    link: "https://hr.ucdavis.edu/news/wpvp/surroundings",
    title: "Be Aware of Your Surroundings: Situational Awareness Tips",
    source: "UC Davis HR"
  },
  {
    link: "https://www.rainn.org/articles/safety-tips-traveling",
    title: "Share Your Travel Plans to Stay Safe",
    source: "RAINN"
  },
  {
    link: "https://www.campussafetymagazine.com/insights/top-safety-tips-for-staying-aware-and-protected-on-the-streets/172189/",
    title: "Walk With Confidence: Street Safety Tips",
    source: "Campus Safety Magazine"
  },
  {
    link: "https://www.refinery29.com/en-us/women-intuition-gut-instinct-personal-safety",
    title: "Trust Your Gut: Listening to Instincts for Personal Safety",
    source: "Refinery29"
  },
  {
    link: "https://www.nsc.org/home-safety/safety-topics/emergency-preparedness",
    title: "Have an Emergency Plan: Be Ready to Respond",
    source: "NSC (National Safety Council)"
  },
  {
    link: "https://gracemartialarts.com/2018/06/30/exit-strategy-whats-yours/",
    title: "Have an Exit Strategy: Stay Prepared for Any Situation",
    source: "Grace Martial Arts"
  }
];


   const defenseTools = [
    {
      title: "Pepper Spray",
      description: "A powerful and compact self-defense tool that disorients attackers instantly.",
      price: "$2.11",
      rating: "4.4",
      link: "https://amzn.in/d/fj4uiM2"
    },
    {
      title: "Stun Gun",
      description: "A rechargeable stun gun with flashlight to keep you safe in the dark.",
      price: "$23,2",
      rating: "4.3",
      link: "https://amzn.in/d/3011fKD"
    },
    {
      title: "Personal Alarm Keychain",
      description: "Emits a loud siren to scare off attackers and alert others nearby.",
      price: "$5.45",
      rating: "5",
      link: "https://amzn.in/d/7jrds7T"
    },
    {
      title: "Tactical Pen",
      description: "Looks like a regular pen but works as a glass breaker and emergency tool.",
      price: "$4.05",
      rating: "4.1",
      link: "https://amzn.in/d/alX0Hp4"
    },
    {
      title: "Folding Pocket Knife",
      description: "Stainless steel pocket knife perfect for emergencies and everyday carry.",
      price: "$4.63",
      rating: "4.4",
      link: "https://amzn.in/d/adWv2LP"
    },
    {
      title: "Safety Keychain Set",
      description: "A compact kit with alarm, sanitizer holder, and a mini self-defense tool.",
      price: "$38.68",
      rating: "4.6",
      link: "https://amzn.in/d/7fpH9wc"
    }
  ];

  const toolImages = [
    "https://tse3.mm.bing.net/th/id/OIP.K4Edw2AdNOFqJRVivMNghwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    "https://d3avoj45mekucs.cloudfront.net/rojakdaily/media/letchumy-tamboo/daily%20stories/19520801_303-copy.jpg",
    "https://tse1.mm.bing.net/th/id/OIP.OqpPHA6sDSB51tsIj6G0sgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    "https://allthingsbrass.com/wp-content/uploads/2018/07/boeker_plus_tactical_pen-1.jpg",
    "https://cdn.frooition.com/140358/images/365BK-4.jpg",
    "https://m.media-amazon.com/images/I/615Nrz-shSL._AC_SL1500_.jpg"
  ];

  const handleVideoClick = (videoId) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  const handleProductClick = (link, title) => {
    window.open(link, '_blank');
    toast({
      title: t('tools_client.toasts.redirect_product_title'),
      description: t('tools_client.toasts.redirect_product_desc', { title }),
    });
  };

  const handleArticleClick = (link, title, source) => {
    window.open(link, '_blank');
    toast({
      title: t('tools_client.toasts.redirect_article_title'),
      description: t('tools_client.toasts.redirect_article_desc', { title, source }),
    });
  };

  return (
    
    <div className="container mx-auto px-4 pb-8">
      <div className="fixed inset-0 -z-10">
  <img
    src="/pngtree.jpg"
    alt="Background"
    className="w-full h-full object-cover blur-sm brightness-75"
  />
</div>
<div className="text-center mb-8">
        <div className="relative inline-block mb-6 hover-lift">
          <div className="relative p-4 bg-card/80 backdrop-blur-xl rounded-full shadow-2xl border border-border/50">
            <Shield className="h-16 w-16 text-primary" />
          </div>
        </div>
        <h2 className="text-4xl font-bold font-headline text-foreground mb-4 hover-lift flex items-center justify-center gap-2">
          {t('tools_page.title')} <Wrench className="h-8 w-8 text-primary" />
        </h2>
        <p className="text-foreground font-semibold text-lg leading-relaxed mb-6">{t('tools_page.subtitle')}</p>
        
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl rounded-3xl p-6 hover-lift hover-glow">
            <div className="relative">
              <Sparkles className="absolute -top-2 -left-2 h-6 w-6 text-primary/80 animate-pulse" />
              <blockquote className="text-lg font-medium italic text-foreground/90 mb-3 leading-relaxed">
                &quot;{inspirationalQuote.text}&quot;
              </blockquote>
              <cite className="text-primary font-semibold">— {inspirationalQuote.author}</cite>
              <Heart className="absolute -bottom-2 -right-2 h-6 w-6 text-primary/80 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="hover-lift">
        <div className="w-full max-w-6xl mx-auto">
          <Tabs defaultValue="tips" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-2 rounded-full max-w-xl mx-auto bg-background shadow-xl border">
              <TabsTrigger value="tutorials" className="rounded-full py-3 flex items-center justify-center text-base font-medium text-foreground/80 transition-colors data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-fuchsia-500 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
                <ShieldQuestion className="mr-2 h-5 w-5" />
                {t('tools_page.tabs.tutorials')}
              </TabsTrigger>
              <TabsTrigger value="tips" className="rounded-full py-3 flex items-center justify-center text-base font-medium text-foreground/80 transition-colors data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-fuchsia-500 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
                <Lightbulb className="mr-2 h-5 w-5" />
                {t('tools_page.tabs.tips')}
              </TabsTrigger>
              <TabsTrigger value="store" className="rounded-full py-3 flex items-center justify-center text-base font-medium text-foreground/80 transition-colors data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-fuchsia-500 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
                <ShoppingBag className="mr-2 h-5 w-5" />
                {t('tools_page.tabs.store')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tutorials">
              <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
                <CardHeader className="p-6">
                  <CardTitle className="text-2xl">{t('tools_client.tutorials.title')}</CardTitle>
                  <CardDescription>
                    {t('tools_client.tutorials.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                  
                  {tutorialVideos.map((video, index) => {
  return (
    <Card 
      key={index}
      onClick={() => handleVideoClick(video.videoId)}
      className="overflow-hidden group cursor-pointer bg-card/90 backdrop-blur-sm hover-lift hover-glow flex flex-col"
    >
      <div className="relative aspect-video bg-muted">
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`; }}
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <PlayCircle className="h-16 w-16 text-white/90 transform group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
          {video.duration}
        </div>
        <div className="absolute bottom-2 left-2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-2 py-1 rounded text-xs font-medium">
          {video.difficulty}
        </div>
      </div>
      <CardContent className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-foreground mb-2">{video.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">{video.description}</p>
        <div className="border-t pt-4 mt-auto">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span className="flex items-center">
              👨‍🏫 {video.instructor}
            </span>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="w-full hover-lift hover:bg-primary hover:text-primary-foreground hover:border-primary"
            onClick={(e) => { e.stopPropagation(); handleVideoClick(video.videoId); }}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {t('tools_client.tutorials.watch_button')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
})}

               
                </CardContent>
                <CardFooter className="p-6 border-t">
                  <div className="w-full text-center">
                    <p className="text-sm text-muted-foreground mb-3" dangerouslySetInnerHTML={{ __html: t('tools_client.tutorials.footer_note') }} />
                    <div className="flex flex-wrap justify-center gap-2 text-xs">
                      <span className="bg-green-500/20 text-green-700 px-2 py-1 rounded">{t('tools_client.tutorials.tag_beginner')}</span>
                      <span className="bg-blue-500/20 text-blue-700 px-2 py-1 rounded">{t('tools_client.tutorials.tag_practical')}</span>
                      <span className="bg-purple-500/20 text-purple-700 px-2 py-1 rounded">{t('tools_client.tutorials.tag_expert')}</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="tips">
              <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
                <CardHeader className="p-6">
                  <CardTitle className="flex items-center text-2xl">
                    <Lightbulb className="mr-3 h-7 w-7" />
                    {t('tools_client.safety_tips.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('tools_client.safety_tips.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                  {safetyTips.map((tip, index) => (
  <Card key={index} className="bg-card/90 backdrop-blur-sm hover-lift hover-glow flex flex-col">
    <div className="p-0">
      <img 
        src={safetyImages[index]} 
        alt={tip.title} 
        loading="lazy"
        className="rounded-t-lg object-cover w-full h-40"
      />
    </div>
    <CardContent className="p-5 flex-1 flex flex-col">
      <h3 className="font-bold text-base text-foreground mb-2">{tip.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{tip.description}</p>
      <div className="border-t pt-3 mt-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground flex items-center">
            <BookOpen className="h-3 w-3 mr-1" />
            {t('tools_client.safety_tips.learn_more')}
          </span>
          <span className="text-xs text-muted-foreground">{articleLinks[index].source}</span>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="w-full hover-lift hover:bg-primary hover:text-primary-foreground hover:border-primary"
          onClick={() => handleArticleClick(articleLinks[index].link, articleLinks[index].title, articleLinks[index].source)}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          <span className="truncate">{t('tools_client.safety_tips.read_article')}</span>
        </Button>
      </div>
    </CardContent>
  </Card>
))}

                </CardContent>
                <CardFooter className="p-6 border-t">
                  <div className="w-full text-center">
                    <p className="text-sm text-muted-foreground mb-3" dangerouslySetInnerHTML={{ __html: t('tools_client.safety_tips.footer_note') }} />
                    <div className="flex flex-wrap justify-center gap-2 text-xs">
                      <span className="bg-blue-500/20 text-blue-700 px-2 py-1 rounded">{t('tools_client.safety_tips.tag_articles')}</span>
                      <span className="bg-green-500/20 text-green-700 px-2 py-1 rounded">{t('tools_client.safety_tips.tag_sources')}</span>
                      <span className="bg-purple-500/20 text-purple-700 px-2 py-1 rounded">{t('tools_client.safety_tips.tag_evidence')}</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="store">
              <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
                <CardHeader className="p-6">
                  <CardTitle className="text-2xl">{t('tools_client.defense_tools.title')}</CardTitle>
                  <CardDescription>
                    {t('tools_client.defense_tools.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                  {defenseTools.map((tool, index) => (
                    <Card key={index} className="flex flex-col justify-between bg-card/90 backdrop-blur-sm hover-lift hover-glow">
                      <div>
                        <div className="p-0 mb-4">
                         <img 
                    src={toolImages[index]} 
                    alt={tool.title}
                    loading="lazy"
                    className="rounded-t-lg object-cover w-full h-48"
                  />
                        </div>
                        <CardContent className="px-5 pb-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-base text-foreground flex-1 pr-2">{tool.title}</h3>
                            <span className="text-lg font-bold text-primary">{tool.price}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{tool.description}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center font-bold">
                              ⭐ {tool.rating}
                            </span>
                            <span className="bg-green-500/20 text-green-700 px-2 py-1 rounded font-medium">
                              {t('tools_client.defense_tools.amazon_choice')}
                            </span>
                          </div>
                        </CardContent>
                      </div>
                      <CardFooter className="px-5 pb-5">
                        <Button 
                          size="lg"
                          className="w-full hover-lift hover-glow bg-orange-500 hover:bg-orange-600 text-white" 
                          onClick={() => handleProductClick(tool.link, tool.title)}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {t('tools_client.defense_tools.buy_button')}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </CardContent>
                <CardFooter className="p-6 border-t">
                  <div className="w-full text-center">
                    <p className="text-sm text-muted-foreground mb-3" dangerouslySetInnerHTML={{ __html: t('tools_client.defense_tools.footer_note') }} />
                    <div className="flex flex-wrap justify-center gap-2 text-xs">
                      <span className="bg-orange-500/20 text-orange-700 px-2 py-1 rounded">{t('tools_client.defense_tools.tag_prime')}</span>
                      <span className="bg-blue-500/20 text-blue-700 px-2 py-1 rounded">{t('tools_client.defense_tools.tag_rated')}</span>
                      <span className="bg-green-500/20 text-green-700 px-2 py-1 rounded">{t('tools_client.defense_tools.tag_verified')}</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
