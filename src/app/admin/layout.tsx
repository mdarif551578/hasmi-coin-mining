
'use client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUserData } from '@/hooks/use-user-data';
import { AdminNav } from '@/components/admin/AdminNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const { userData, loading: userLoading } = useUserData();
  const router = useRouter();

  const loading = authLoading || userLoading;

  useEffect(() => {
    if (!loading) {
      if (!user || userData?.role !== 'admin') {
        router.push('/login');
      }
    }
  }, [user, userData, loading, router]);

  if (loading || !user || userData?.role !== 'admin') {
    return (
       <div className="flex items-center justify-center h-screen bg-background">
          <p className="text-sm text-muted-foreground">Loading Admin Panel...</p>
       </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-4 md:p-6 bg-muted/40">
        {children}
      </main>
    </div>
  );
}
