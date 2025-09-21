
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRedirectResult } from 'firebase/auth';
import { auth, createUserDocument } from '@/lib/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const AUTH_TIMEOUT = 20000; // 20 seconds

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
        if (isMounted) {
            setError("Authentication timed out. Please try logging in again.");
            setTimeout(() => router.push('/login'), 5000);
        }
    }, AUTH_TIMEOUT);

    const handleRedirect = async () => {
        try {
            const result = await getRedirectResult(auth);
            if (result && result.user) {
                // User signed in.
                await createUserDocument(result.user);
                if(isMounted) {
                    router.push('/dashboard');
                }
            } else {
                // This can happen if the user cancels the login, or if they just visit the callback URL directly.
                // We also check the current user state as a fallback.
                if (auth.currentUser) {
                     if(isMounted) router.push('/dashboard');
                } else {
                     if(isMounted) router.push('/login');
                }
            }
        } catch (e: any) {
            if (isMounted) {
                console.error("Firebase Auth Error:", e);
                setError(`Authentication failed: ${e.message}. You will be redirected to the login page.`);
                setTimeout(() => router.push('/login'), 5000);
            }
        } finally {
            clearTimeout(timeoutId);
        }
    };
    
    handleRedirect();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };

  }, [router]);

  // If there's an error, display it
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // This is the content that will be displayed while authentication is in progress.
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div
            className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center
            shadow-[0_0_15px_theme(colors.primary),_0_0_30px_theme(colors.primary)] animate-pulse"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-16 h-16 text-primary"
            >
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                <path d="M10.5 15.5H14s1.5 0 1.5-1.5-1.5-1.5-1.5-1.5H10.5V10h4" />
                <path d="M12 8.5V7" />
                <path d="M12 17v-1.5" />
            </svg>
        </div>
        <p className="text-sm text-muted-foreground">Finalizing your login...</p>
      </div>
    </div>
  );
}
