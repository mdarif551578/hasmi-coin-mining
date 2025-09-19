
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function AuthCallback() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // We wait for the loading to be false, which indicates auth state has been checked.
    if (!loading) {
      // If the user object is available, redirect to the dashboard.
      if (user) {
        router.push('/dashboard');
      } else {
        // If there's no user, it means login failed or was cancelled.
        // Redirect to the login page.
        router.push('/login');
      }
    }
  }, [user, loading, router]);

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
