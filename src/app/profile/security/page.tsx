
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required.' }),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SecurityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);


  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormValues) => {
    if (!user || !user.email) return;

    setIsSaving(true);
    
    try {
        const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, data.newPassword);
        
        toast({
            title: 'Password Updated',
            description: 'Your password has been changed successfully.',
        });
        reset();

    } catch (error: any) {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
             setError('currentPassword', {
                type: 'manual',
                message: 'Incorrect current password.',
            });
        } else {
             toast({
                title: 'Update Failed',
                description: 'Could not change your password. Please try again.',
                variant: 'destructive',
            });
        }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
       <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-9 h-9" asChild>
            <Link href="/profile">
                <ChevronLeft />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">Security</h1>
       </div>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>For your security, you must enter your current password to change it.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                    <Input id="currentPassword" type={showCurrentPassword ? 'text' : 'password'} {...register('currentPassword')} />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 h-full px-3"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                        {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                </div>
                {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                 <div className="relative">
                    <Input id="newPassword" type={showNewPassword ? 'text' : 'password'} {...register('newPassword')} />
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                        {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                </div>
                {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type={showNewPassword ? 'text' : 'password'} {...register('confirmPassword')} />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" className="w-full h-10" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Update Password'}
              </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
