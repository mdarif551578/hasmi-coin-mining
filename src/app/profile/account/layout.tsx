
'use client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BottomNavBar } from '@/components/BottomNavBar';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
       <div className="flex items-center justify-center h-screen bg-background">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div
                className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center
                shadow-[0_0_15px_theme(colors.primary),_0_0_30px_theme(colors.primary)]"
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
             <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
       </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNavBar />
    </div>
  );
}
