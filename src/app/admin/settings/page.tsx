
'use client';
import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const settingsSchema = z.object({
  usd_to_hc: z.coerce.number().positive(),
  'deposit_methods.bkash.rate': z.coerce.number().positive(),
  'deposit_methods.bkash.agent_number': z.string(),
  'deposit_methods.nagad.rate': z.coerce.number().positive(),
  'deposit_methods.nagad.agent_number': z.string(),
  'referral_bonus.referee_bonus': z.coerce.number().min(0),
  'referral_bonus.referrer_bonus': z.coerce.number().min(0),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    const settingsDocRef = doc(db, 'settings', 'exchangeRates');
    const unsubscribe = onSnapshot(settingsDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        reset({
          usd_to_hc: data.usd_to_hc,
          'deposit_methods.bkash.rate': data.deposit_methods?.bkash?.rate,
          'deposit_methods.bkash.agent_number': data.deposit_methods?.bkash?.agent_number,
          'deposit_methods.nagad.rate': data.deposit_methods?.nagad?.rate,
          'deposit_methods.nagad.agent_number': data.deposit_methods?.nagad?.agent_number,
          'referral_bonus.referee_bonus': data.referral_bonus?.referee_bonus,
          'referral_bonus.referrer_bonus': data.referral_bonus?.referrer_bonus,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [reset]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      const settingsDocRef = doc(db, 'settings', 'exchangeRates');
      // We need to un-flatten the data for Firestore
      const updateData = {
          usd_to_hc: data.usd_to_hc,
          deposit_methods: {
              bkash: {
                  rate: data['deposit_methods.bkash.rate'],
                  agent_number: data['deposit_methods.bkash.agent_number']
              },
              nagad: {
                   rate: data['deposit_methods.nagad.rate'],
                  agent_number: data['deposit_methods.nagad.agent_number']
              }
          },
          referral_bonus: {
              referee_bonus: data['referral_bonus.referee_bonus'],
              referrer_bonus: data['referral_bonus.referrer_bonus']
          }
      };
      await updateDoc(settingsDocRef, updateData);
      toast({ title: 'Success', description: 'Settings have been updated.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update settings.' });
      console.error(error);
    }
  };
  
  const FormSkeleton = () => (
      <div className="space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <div className="space-y-2"><Skeleton className="h-4 w-1/5" /><Skeleton className="h-10 w-full" /></div>
          </div>
           <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Skeleton className="h-4 w-1/5" /><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-1/5" /><Skeleton className="h-10 w-full" /></div>
            </div>
          </div>
      </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">App Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Global Settings</CardTitle>
            <CardDescription>Manage exchange rates, deposit methods, and other global configurations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {loading ? <FormSkeleton /> : (
                <>
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Exchange & Referral</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="usd_to_hc">USD to HC Rate</Label>
                            <Input id="usd_to_hc" type="number" step="any" {...register('usd_to_hc')} />
                            {errors.usd_to_hc && <p className="text-red-500 text-sm">{errors.usd_to_hc.message}</p>}
                        </div>
                         <div>
                            <Label htmlFor="referrer_bonus">Referrer Bonus (HC)</Label>
                            <Input id="referrer_bonus" type="number" step="any" {...register('referral_bonus.referrer_bonus')} />
                             {errors['referral_bonus.referrer_bonus'] && <p className="text-red-500 text-sm">{errors['referral_bonus.referrer_bonus'].message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="referee_bonus">Referee Bonus (HC)</Label>
                            <Input id="referee_bonus" type="number" step="any" {...register('referral_bonus.referee_bonus')} />
                            {errors['referral_bonus.referee_bonus'] && <p className="text-red-500 text-sm">{errors['referral_bonus.referee_bonus'].message}</p>}
                        </div>
                    </div>
                </div>

                 <div className="space-y-4">
                    <h3 className="text-lg font-semibold">bKash Deposit Method</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="bkash_rate">Rate (BDT per USD)</Label>
                            <Input id="bkash_rate" type="number" step="any" {...register('deposit_methods.bkash.rate')} />
                            {errors['deposit_methods.bkash.rate'] && <p className="text-red-500 text-sm">{errors['deposit_methods.bkash.rate'].message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="bkash_agent">Agent Number</Label>
                            <Input id="bkash_agent" {...register('deposit_methods.bkash.agent_number')} />
                             {errors['deposit_methods.bkash.agent_number'] && <p className="text-red-500 text-sm">{errors['deposit_methods.bkash.agent_number'].message}</p>}
                        </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Nagad Deposit Method</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="nagad_rate">Rate (BDT per USD)</Label>
                            <Input id="nagad_rate" type="number" step="any" {...register('deposit_methods.nagad.rate')} />
                            {errors['deposit_methods.nagad.rate'] && <p className="text-red-500 text-sm">{errors['deposit_methods.nagad.rate'].message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="nagad_agent">Agent Number</Label>
                            <Input id="nagad_agent" {...register('deposit_methods.nagad.agent_number')} />
                            {errors['deposit_methods.nagad.agent_number'] && <p className="text-red-500 text-sm">{errors['deposit_methods.nagad.agent_number'].message}</p>}
                        </div>
                    </div>
                 </div>
                </>
            )}
          </CardContent>
        </Card>
        <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting ? 'Saving...' : 'Save All Settings'}
            </Button>
        </div>
      </form>
    </div>
  );
}
