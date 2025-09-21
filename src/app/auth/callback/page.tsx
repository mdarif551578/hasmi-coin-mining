
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const AUTH_TIMEOUT = 15000; // 15 seconds

export default function AuthCallback() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set a timeout for the authentication process
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError("Authentication timed out. Please try again.");
        setTimeout(() => router.push('/login'), 5000);
      }
    }, AUTH_TIMEOUT);

    // If loading is finished, check the result
    if (!loading && !error) {
      clearTimeout(timeoutId); // Clear the timeout as we have a result
      if (user) {
        // On success, redirect to the dashboard
        router.push('/dashboard');
      } else {
        // On failure, set an error and redirect after a delay
        setError("Authentication failed. You will be redirected to the login page.");
        setTimeout(() => router.push('/login'), 5000);
      }
    }

    // Cleanup the timeout if the component unmounts
    return () => clearTimeout(timeoutId);

  }, [user, loading, router, error]);

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
