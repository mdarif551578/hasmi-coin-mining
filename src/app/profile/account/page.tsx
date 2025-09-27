
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUserData } from '@/hooks/use-user-data';
import { useAuth } from '@/lib/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const profileSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AccountPage() {
  const { user } = useAuth();
  const { userData, loading: userLoading } = useUserData();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (userData) {
      reset({
        displayName: userData.displayName || '',
        phone: userData.phone || '',
      });
    }
  }, [userData, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: data.displayName,
        phone: data.phone,
      });
      toast({
        title: 'Profile Updated',
        description: 'Your account information has been saved.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Could not save your changes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const FormSkeleton = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
       <Skeleton className="h-10 w-full" />
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
       <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-9 h-9" asChild>
            <Link href="/profile">
                <ChevronLeft />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">Account Information</h1>
       </div>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Edit Your Profile</CardTitle>
          <CardDescription>Update your personal details below. Changes will be saved to your profile.</CardDescription>
        </CardHeader>
        <CardContent>
          {userLoading ? (
            <FormSkeleton />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ''} readOnly disabled className="cursor-not-allowed bg-muted/50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Full Name</Label>
                <Input id="displayName" {...register('displayName')} />
                {errors.displayName && <p className="text-sm text-destructive">{errors.displayName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" {...register('phone')} placeholder="e.g., +1234567890" />
                 {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>

              <Button type="submit" className="w-full h-10" disabled={isSaving || !isDirty}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
