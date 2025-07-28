
"use client";

import React, { useState, useEffect } from 'react';
import { useContacts } from '@/hooks/use-contacts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { X, User, Phone, Plus, Pencil, Trash2, Mail, Users, Heart, Sparkles, Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/context/language-context';

export default function ContactsPage() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { contacts, addContact, removeContact, updateContact } = useContacts();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingContactId, setEditingContactId] = useState(null);
    const inspirationalQuotes = t('contacts_page.inspirational_quotes');
    const countryCodes = t('contacts_page.country_codes');
    const [currentQuote, setCurrentQuote] = useState(inspirationalQuotes[0]);
    const [isClient, setIsClient] = useState(false);

    const contactFormSchema = z.object({
      name: z.string().min(2, { message: t('contacts_page.form_errors.name_length') }),
      countryCode: z.string({ required_error: t('contacts_page.form_errors.country_code_required') }).min(1, { message: t('contacts_page.form_errors.country_code_required') }),
      phoneNumber: z.string().min(5, { message: t('contacts_page.form_errors.phone_length') }),
    });

    const form = useForm({
      resolver: zodResolver(contactFormSchema),
      defaultValues: { name: "", countryCode: "91", phoneNumber: "" },
    });

    useEffect(() => {
        setIsClient(true);
        const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
        setCurrentQuote(randomQuote);
    }, [inspirationalQuotes]);


    useEffect(() => {
      if (!isFormOpen) {
          setEditingContactId(null);
          form.reset({ name: "", countryCode: "91", phoneNumber: "" });
      }
    }, [isFormOpen, form]);
    
    const handleFormSubmit = (data) => {
      const fullPhoneNumber = `+${data.countryCode}${data.phoneNumber.replace(/\D/g, '')}`;
      const contactData = {
          name: data.name,
          phone: fullPhoneNumber
      };

      if (editingContactId) {
        updateContact(editingContactId, contactData);
        toast({ title: t('contacts_page.toasts.updated_title'), description: t('contacts_page.toasts.updated_desc', { name: contactData.name }) });
      } else {
        addContact(contactData);
        toast({ title: t('contacts_page.toasts.added_title'), description: t('contacts_page.toasts.added_desc', { name: contactData.name }) });
      }
      
      setIsFormOpen(false);
    };

    const handleEditClick = (contact) => {
      setEditingContactId(contact.id);
      let countryCode = '';
      let phoneNumber = '';
      const phone = contact.phone.replace('+', '');
      
      const foundCode = countryCodes.find(code => phone.startsWith(code.value));

      if (foundCode) {
          countryCode = foundCode.value;
          phoneNumber = phone.substring(foundCode.value.length);
      } else if (phone) {
          if (phone.length > 10) {
              const potentialCode = phone.substring(0, phone.length - 10);
              if (potentialCode.length <= 3) {
                  countryCode = potentialCode;
                  phoneNumber = phone.substring(potentialCode.length);
              }
          }
      }
      
      form.reset({
        name: contact.name,
        countryCode: countryCode || '91',
        phoneNumber: phoneNumber,
      });
      
      setIsFormOpen(true);
    };

    return (
        <div className="container mx-auto flex-1 px-4 pb-8">
            <div className="fixed inset-0 -z-10">
  <img
    src="/contact.jpg"
    alt="Background"
    className="w-full h-full object-cover blur-sm brightness-75"
  />
</div>

        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
            <div className="relative inline-block mb-6 hover-lift">
                <div className="relative p-4 bg-card/80 backdrop-blur-xl rounded-full shadow-2xl border border-border/50">
                <Users className="h-16 w-16 text-primary" />
                </div>
            </div>
            <h2 className="text-4xl font-bold font-headline text-white mb-4 hover-lift">
                {t('contacts_page.title')}
            </h2>
            <p className="text-foreground font-semibold text-white leading-relaxed mb-6">{t('contacts_page.subtitle')}</p>
            <div className="flex items-center justify-center space-x-2 mt-4">
                <Heart className="h-5 w-5 text-primary animate-pulse bg-pink-50" />
                <span className="text-white font-bold">
                {contacts.length === 1 ? t('contacts_page.contacts_count.one', { count: contacts.length }) : t('contacts_page.contacts_count.other', { count: contacts.length })}
                </span>
            </div>
            
            <div className="max-w-xl mx-auto mt-8">
                <div className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl rounded-3xl p-6 hover-lift hover-glow">
                <div className="relative">
                    {!isClient ? (
                    <>
                        <Skeleton className="h-6 w-3/4 mb-4 mx-auto" />
                        <Skeleton className="h-4 w-1/4 ml-auto" />
                    </>
                    ) : (
                    <>
                        <Sparkles className="absolute -top-2 -left-2 h-6 w-6 text-primary/80 animate-pulse" />
                        <blockquote className="text-lg font-medium italic text-foreground/90 mb-3 leading-relaxed">
                        &quot;{currentQuote.text}&quot;
                        </blockquote>
                        <cite className="text-foreground font-semibold">— {currentQuote.author}</cite>
                        <Star className="absolute -bottom-2 -right-2 h-6 w-6 text-destructive/80 animate-pulse" />
                    </>
                    )}
                </div>
                </div>
            </div>
            </div>

            <div className="mb-6">
            <Button
                onClick={() => setIsFormOpen(true)}
                className="w-full hover-lift hover-glow text-base py-6"
            >
                <Plus className="mr-2 h-5 w-5" />
                {t('contacts_page.add_new_button')}
            </Button>
            </div>

            {contacts.length === 0 ? (
            <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl hover-lift hover-glow">
                <CardContent className="text-center py-16 px-4">
                <div className="relative inline-block mb-6 hover-lift">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                    <Plus className="h-4 w-4 text-primary-foreground" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{t('contacts_page.no_contacts.title')}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                    {t('contacts_page.no_contacts.description')}
                </p>
                <Button onClick={() => setIsFormOpen(true)} className="hover-lift hover-glow">
                    <Plus className="mr-2 h-5 w-5" />
                    {t('contacts_page.no_contacts.add_first_button')}
                </Button>
                </CardContent>
            </Card>
            ) : (
            <div className="space-y-4">
                {contacts.map((contact) => (
                <Card key={contact.id} className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl hover-lift hover-glow">
                    <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-4 min-w-0">
                        <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl shadow-soft flex-shrink-0">
                            <User className="h-7 w-7 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-foreground text-lg truncate">{contact.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{contact.phone}</span>
                            </div>
                        </div>
                        </div>
                        <div className="flex flex-shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(contact)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => removeContact(contact.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>
            )}

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="bg-background/95 backdrop-blur-xl border-border/50">
                <DialogHeader>
                <DialogTitle className="text-lg">{editingContactId ? t('contacts_page.dialog.edit_title') : t('contacts_page.dialog.add_title')}</DialogTitle>
                <DialogDescription>
                    {t('contacts_page.dialog.description')}
                </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('contacts_page.dialog.name_label')}</FormLabel>
                        <FormControl><Input placeholder={t('contacts_page.dialog.name_placeholder')} {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormItem>
                        <FormLabel>{t('contacts_page.dialog.phone_label')}</FormLabel>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <FormField control={form.control} name="countryCode" render={({ field }) => (
                                <FormItem className="w-full sm:w-1/3">
                                    <Select onValueChange={field.onChange} value={field.value} defaultValue="91">
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('contacts_page.dialog.phone_code_placeholder')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {countryCodes.map(code => (
                                                <SelectItem key={code.value} value={code.value}>{code.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                                <FormItem className="w-full sm:w-2/3">
                                    <FormControl><Input type="tel" placeholder={t('contacts_page.dialog.phone_number_placeholder')} {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </FormItem>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>{t('common.cancel')}</Button>
                        <Button type="submit">{editingContactId ? t('contacts_page.dialog.update_button') : t('contacts_page.dialog.save_button')}</Button>
                    </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
            </Dialog>
        </div>
        </div>
    );
}
