'use client';
import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, setHours, setMinutes, setSeconds } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';

const planSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  rate: z.string().optional(),
  duration: z.string().min(1, 'Duration is required'),
  price: z.coerce.number().positive('Price must be positive'),
  cost: z.coerce.number().optional(),
  profit: z.coerce.number().optional(),
});

const settingsSchema = z.object({
  usd_to_hc: z.coerce.number().positive(),
  'deposit_methods.bkash.rate': z.coerce.number().positive(),
  'deposit_methods.bkash.agent_number': z.string(),
  'deposit_methods.nagad.rate': z.coerce.number().positive(),
  'deposit_methods.nagad.agent_number': z.string(),
  'referral_bonus.referee_bonus': z.coerce.number().min(0),
  'referral_bonus.referrer_bonus': z.coerce.number().min(0),
  'mining.free_claim_reward': z.coerce.number().min(0, 'Reward must be non-negative'),
  'mining.claim_interval_hours': z.coerce.number().positive('Interval must be positive'),
  'mining.token_launch_date': z.date(),
  'mining.p2p_sell_fee_percent': z.coerce.number().min(0).max(100),
  paidPlans: z.array(planSchema).optional(),
  nftPlans: z.array(planSchema).optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
  });

  const launchDate = watch('mining.token_launch_date');

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    if (launchDate && time) {
      const [hours, minutes] = time.split(':').map(Number);
      let newDate = setHours(launchDate, hours);
      newDate = setMinutes(newDate, minutes);
      newDate = setSeconds(newDate, 0);
      setValue('mining.token_launch_date', newDate, { shouldDirty: true });
    }
  };

  const { fields: paidPlanFields, append: appendPaidPlan, remove: removePaidPlan } = useFieldArray({
    control,
    name: "paidPlans",
  });

  const { fields: nftPlanFields, append: appendNftPlan, remove: removeNftPlan } = useFieldArray({
    control,
    name: "nftPlans",
  });


  useEffect(() => {
    const settingsDocRef = doc(db, 'settings', 'exchangeRates');
    const unsubscribe = onSnapshot(settingsDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const launchDate = data.mining?.token_launch_date?.toDate ? data.mining.token_launch_date.toDate() : new Date();
        reset({
          usd_to_hc: data.usd_to_hc,
          'deposit_methods.bkash.rate': data.deposit_methods?.bkash?.rate,
          'deposit_methods.bkash.agent_number': data.deposit_methods?.bkash?.agent_number,
          'deposit_methods.nagad.rate': data.deposit_methods?.nagad?.rate,
          'deposit_methods.nagad.agent_number': data.deposit_methods?.nagad?.agent_number,
          'referral_bonus.referee_bonus': data.referral_bonus?.referee_bonus,
          'referral_bonus.referrer_bonus': data.referral_bonus?.referrer_bonus,
          'mining.free_claim_reward': data.mining?.free_claim_reward,
          'mining.claim_interval_hours': data.mining?.claim_interval_hours,
          'mining.token_launch_date': launchDate,
          'mining.p2p_sell_fee_percent': data.mining?.p2p_sell_fee_percent,
          paidPlans: data.mining?.paidPlans || [],
          nftPlans: data.mining?.nftPlans || [],
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [reset]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      const settingsDocRef = doc(db, 'settings', 'exchangeRates');
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
          },
          mining: {
              free_claim_reward: data['mining.free_claim_reward'],
              claim_interval_hours: data['mining.claim_interval_hours'],
              token_launch_date: data['mining.token_launch_date'],
              p2p_sell_fee_percent: data['mining.p2p_sell_fee_percent'],
              paidPlans: data.paidPlans?.map(p => ({...p, id: p.id || crypto.randomUUID() })) || [],
              nftPlans: data.nftPlans?.map(p => ({...p, id: p.id || crypto.randomUUID() })) || [],
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
          <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
      </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">App Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {loading ? <FormSkeleton /> : (
                <>
                <Card>
                  <CardHeader>
                    <CardTitle>Exchange & Referral</CardTitle>
                  </CardHeader>
                   <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="usd_to_hc">USD to HC Rate</Label>
                            <Input id="usd_to_hc" type="number" step="any" {...register('usd_to_hc')} />
                            {errors.usd_to_hc && <p className="text-red-500 text-sm">{errors.usd_to_hc.message}</p>}
                        </div>
                         <div>
                            <Label htmlFor="referrer_bonus">Referrer Bonus (HC)</Label>
                            <Input id="referrer_bonus" type="number" step="any" {...register('referral_bonus.referrer_bonus')} />
                             {errors['referral_bonus.referrer_bonus'] && <p className="text-red-500 text-sm">{errors['referral_bonus.referrer_bonus']?.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="referee_bonus">Referee Bonus (HC)</Label>
                            <Input id="referee_bonus" type="number" step="any" {...register('referral_bonus.referee_bonus')} />
                            {errors['referral_bonus.referee_bonus'] && <p className="text-red-500 text-sm">{errors['referral_bonus.referee_bonus']?.message}</p>}
                        </div>
                    </div>
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader>
                    <CardTitle>Deposit Methods</CardTitle>
                  </CardHeader>
                   <CardContent className="space-y-6">
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold">bKash</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="bkash_rate">Rate (BDT per USD)</Label>
                                <Input id="bkash_rate" type="number" step="any" {...register('deposit_methods.bkash.rate')} />
                                {errors['deposit_methods.bkash.rate'] && <p className="text-red-500 text-sm">{errors['deposit_methods.bkash.rate']?.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="bkash_agent">Agent Number</Label>
                                <Input id="bkash_agent" {...register('deposit_methods.bkash.agent_number')} />
                                 {errors['deposit_methods.bkash.agent_number'] && <p className="text-red-500 text-sm">{errors['deposit_methods.bkash.agent_number']?.message}</p>}
                            </div>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Nagad</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="nagad_rate">Rate (BDT per USD)</Label>
                                <Input id="nagad_rate" type="number" step="any" {...register('deposit_methods.nagad.rate')} />
                                {errors['deposit_methods.nagad.rate'] && <p className="text-red-500 text-sm">{errors['deposit_methods.nagad.rate']?.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="nagad_agent">Agent Number</Label>
                                <Input id="nagad_agent" {...register('deposit_methods.nagad.agent_number')} />
                                {errors['deposit_methods.nagad.agent_number'] && <p className="text-red-500 text-sm">{errors['deposit_methods.nagad.agent_number']?.message}</p>}
                            </div>
                        </div>
                     </div>
                   </CardContent>
                </Card>

                 <Card>
                  <CardHeader>
                    <CardTitle>Mining & Economy</CardTitle>
                  </CardHeader>
                   <CardContent className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div>
                            <Label htmlFor="free_claim_reward">Free Claim Reward (HC)</Label>
                            <Input id="free_claim_reward" type="number" step="any" {...register('mining.free_claim_reward')} />
                             {errors['mining.free_claim_reward'] && <p className="text-red-500 text-sm">{errors['mining.free_claim_reward']?.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="claim_interval_hours">Claim Interval (Hours)</Label>
                            <Input id="claim_interval_hours" type="number" step="any" {...register('mining.claim_interval_hours')} />
                            {errors['mining.claim_interval_hours'] && <p className="text-red-500 text-sm">{errors['mining.claim_interval_hours']?.message}</p>}
                        </div>
                         <div>
                            <Label htmlFor="p2p_sell_fee_percent">P2P Sell Fee (%)</Label>
                            <Input id="p2p_sell_fee_percent" type="number" step="any" {...register('mining.p2p_sell_fee_percent')} />
                            {errors['mining.p2p_sell_fee_percent'] && <p className="text-red-500 text-sm">{errors['mining.p2p_sell_fee_percent']?.message}</p>}
                        </div>
                         <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Token Launch Date</Label>
                            <Controller
                                  control={control}
                                  name="mining.token_launch_date"
                                  render={({ field }) => (
                                      <Popover>
                                          <PopoverTrigger asChild>
                                              <Button
                                              variant={"outline"}
                                              className={cn(
                                                  "w-full justify-start text-left font-normal",
                                                  !field.value && "text-muted-foreground"
                                              )}
                                              >
                                              <CalendarIcon className="mr-2 h-4 w-4" />
                                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                              </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0">
                                              <Calendar
                                              mode="single"
                                              selected={field.value}
                                              onSelect={field.onChange}
                                              initialFocus
                                              />
                                          </PopoverContent>
                                      </Popover>
                                  )}
                              />
                          </div>
                           <div>
                                <Label>Launch Time</Label>
                                <Input 
                                  type="time"
                                  value={launchDate instanceof Date && !isNaN(launchDate.getTime()) ? format(launchDate, 'HH:mm') : ''}
                                  onChange={handleTimeChange}
                                />
                           </div>
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Paid Plans</h3>
                        {paidPlanFields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end p-2 border rounded-lg">
                                <Input {...register(`paidPlans.${index}.id`)} type="hidden" />
                                <div><Label>Name</Label><Input {...register(`paidPlans.${index}.name`)} placeholder="e.g. Starter Miner" /></div>
                                <div><Label>Rate</Label><Input {...register(`paidPlans.${index}.rate`)} placeholder="e.g. 0.5 HC/hr" /></div>
                                <div><Label>Duration</Label><Input {...register(`paidPlans.${index}.duration`)} placeholder="e.g. 30 days" /></div>
                                <div><Label>Price (USD)</Label><Input type="number" step="any" {...register(`paidPlans.${index}.price`)} placeholder="e.g. 10" /></div>
                                <Button type="button" variant="destructive" size="icon" onClick={() => removePaidPlan(index)}><Trash2 className="size-4" /></Button>
                            </div>
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => appendPaidPlan({ name: 'New Plan', duration: '30 days', price: 1, rate: '1 HC/hr' })}><Plus className="mr-2" />Add Paid Plan</Button>
                    </div>
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold">NFT Plans</h3>
                         {nftPlanFields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end p-2 border rounded-lg">
                                 <Input {...register(`nftPlans.${index}.id`)} type="hidden" />
                                <div><Label>Name</Label><Input {...register(`nftPlans.${index}.name`)} placeholder="e.g. Bronze NFT" /></div>
                                <div><Label>Cost (USD)</Label><Input type="number" step="any" {...register(`nftPlans.${index}.cost`)} placeholder="e.g. 5" /></div>
                                <div><Label>Profit (USD)</Label><Input type="number" step="any" {...register(`nftPlans.${index}.profit`)} placeholder="e.g. 7.5" /></div>
                                <div><Label>Duration</Label><Input {...register(`nftPlans.${index}.duration`)} placeholder="e.g. 30 days" /></div>
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeNftPlan(index)}><Trash2 className="size-4" /></Button>
                            </div>
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => appendNftPlan({ name: 'New NFT', duration: '30 days', price: 0, cost: 1, profit: 1.5 })}><Plus className="mr-2" />Add NFT Plan</Button>
                    </div>
                   </CardContent>
                </Card>
                </>
            )}
        <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSubmitting || loading} className="w-full md:w-auto">
                {isSubmitting ? 'Saving...' : 'Save All Settings'}
            </Button>
        </div>
      </form>
    </div>
  );
}
