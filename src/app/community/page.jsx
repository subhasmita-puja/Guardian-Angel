
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, ThumbsUp, Send, Loader2, Heart, Sparkles, Star, Users, Lightbulb } from 'lucide-react';
import { moderateContent } from '@/ai/flows/moderate-content-flow';
import { useTranslation } from '@/context/language-context';

const BicepIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7 9a1 1 0 0 1 1-1h3v2H9v5h2.5a2.5 2.5 0 0 0 2.5-2.5V8.5a1.5 1.5 0 0 1 1.5-1.5h1a2 2 0 0 1 2 2V12a5 5 0 0 1-5 5H6a1 1 0 0 1-1-1V9Z"></path>
  </svg>
);

const UserIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#8B5CF6" className={className}>
    <path d="M15.71 12.71a6 6 0 1 0-7.42 0A10 10 0 0 0 2 22a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1 10 10 0 0 0-6.29-9.29ZM12 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
  </svg>
);

function CommunityStats() {
  const { t } = useTranslation();
  const stats = [
    { value: "1,247", label: t('community_page.stats.members'), icon: Users, color: "text-green-500" },
    { value: "3,891", label: t('community_page.stats.tips_shared'), icon: Lightbulb, color: "text-primary" },
    { value: "12,456", label: t('community_page.stats.lives_empowered'), icon: BicepIcon, color: "text-purple-500" },
  ];

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl mt-8">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center gap-2 hover-lift">
              <div className="flex items-center gap-3">
                <span className={`text-4xl font-bold ${stat.color}`}>{stat.value}</span>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CommunityPage() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const pageQuote = t('community_page.page_quote');
    const initialPosts = t('community_page.initial_posts');
    
    const [posts, setPosts] = useState(initialPosts.map((post, index) => ({
      ...post,
      id: 3 - index,
      avatar: ["https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80", "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=80", "https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=80"][index],
      avatarHint: ["woman smiling", "woman portrait", "woman portrait"][index]
    })));

    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handlePostSubmit = async (e) => {
      e.preventDefault();
      if (!newPostContent.trim()) return;

      setIsPosting(true);
      try {
        const moderationResult = await moderateContent({ text: newPostContent });

        if (moderationResult.isAppropriate) {
          const newPost = {
            id: Date.now(),
            author: t('common.you'),
            avatar: "https://placehold.co/40x40.png",
            avatarHint: "person abstract",
            time: t('common.just_now'),
            content: newPostContent,
            likes: 0,
            comments: 0,
          };
          setPosts([newPost, ...posts]);
          setNewPostContent('');
          toast({
            title: t('community_page.toasts.post_success_title'),
            description: t('community_page.toasts.post_success_desc'),
          });
        } else {
          toast({
            variant: "destructive",
            title: t('community_page.toasts.moderated_title'),
            description: moderationResult.reason || t('community_page.toasts.moderated_desc'),
          });
        }
      } catch (error) {
        console.error("Error posting content:", error);
        toast({
          variant: "destructive",
          title: t('community_page.toasts.error_title'),
          description: t('community_page.toasts.error_desc'),
        });
      } finally {
        setIsPosting(false);
      }
    };

    return (
        <div className="container mx-auto px-4 pb-8">
          <div className="fixed inset-0 -z-10">
  <img
    src="/women2.jpg"
    alt="Background"
    className="w-full h-full object-cover blur-sm brightness-75"
  />
</div>

            <div className="text-center mb-12 max-w-4xl mx-auto">
                <div className="relative inline-block mb-6 hover-lift">
                    <div className="relative p-4 bg-card/80 backdrop-blur-xl rounded-full shadow-2xl border border-border/50">
                        <MessageSquare className="h-16 w-16 text-primary" />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground flex items-center justify-center gap-3">
                    {t('community_page.title')}
                </h1>

                <p className="text-foreground font-semibold text-lg leading-relaxed mt-4">
                    {t('community_page.subtitle')}
                </p>

                <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 bg-white">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">{t('community_page.banner')}</span>
                    <span className="text-lg">🌍</span>
                    <Heart className="h-4 w-4 text-primary" />
                </div>
            </div>

            <div className="max-w-4xl mx-auto mb-12">
                <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl rounded-3xl p-8 hover-lift hover-glow">
                    <div className="relative">
                        <span className="absolute -top-4 -left-4 text-6xl text-primary/30 font-serif">“</span>
                        <blockquote className="text-2xl font-medium italic text-foreground/90 mb-4 leading-relaxed text-center">
                            {pageQuote.text}
                        </blockquote>
                        <cite className="block text-right text-primary font-semibold">— {pageQuote.author}</cite>
                        <Sparkles className="absolute -bottom-4 -right-4 h-8 w-8 text-primary/50 animate-pulse" />
                        <span className="absolute -bottom-2 -right-10 text-6xl text-primary/30 font-serif transform scale-x-[-1]">“</span>
                    </div>
                </Card>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
                <form onSubmit={handlePostSubmit}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <MessageSquare className="h-6 w-6 text-primary" />
                      {t('community_page.post_form.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('community_page.post_form.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder={t('community_page.post_form.placeholder')}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      rows={4}
                      disabled={isPosting}
                      className="bg-background/50"
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">{t('community_page.post_form.ai_review')}</p>
                    <Button type="submit" disabled={isPosting || !newPostContent.trim()} className="hover-lift hover-glow">
                      {isPosting ? <Loader2 className="animate-spin" /> : <Send />}
                      <span className="ml-2">{t('common.post')}</span>
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              <div className="space-y-4">
                {posts.map(post => (
                  <Card key={post.id} className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg hover-lift hover-glow">
                    <CardHeader className="flex flex-row items-start gap-4 p-4 sm:p-6">
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-10 h-10 border-2 border-primary/20">
                          <AvatarImage src={post.avatar} alt={post.author} data-ai-hint={post.avatarHint} />
                          <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></div>
                      </div>
                      <div className="w-full">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{post.author}</p>
                            <UserIcon />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 text-primary" />
                            <span>{t('community_page.post_card.community_member')}</span>
                            <span>•</span>
                            <span>{post.time}</span>
                            <span role="img" aria-label="alarm clock">⏰</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pt-0 pb-4">
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap">{post.content}</p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between gap-6 text-sm text-muted-foreground px-4 sm:px-6 pb-4 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <ThumbsUp className="h-4 w-4"/>
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4"/>
                          <span>{t('community_page.post_card.comments', { count: post.comments })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-primary/80">
                          <Heart className="h-4 w-4"/>
                          <span className="text-xs font-medium">{t('community_page.post_card.positivity')}</span>
                          <Sparkles className="h-4 w-4"/>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <CommunityStats />
            </div>
        </div>
    );
}
