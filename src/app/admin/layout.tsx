
'use client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUserData } from '@/hooks/use-user-data';
import { AdminNav } from '@/components/admin/AdminNav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const { userData, loading: userLoading } = useUserData();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const loading = authLoading || userLoading;

  useEffect(() => {
    if (!loading) {
      if (!user || userData?.role !== 'admin') {
        router.push('/login');
      }
    }
  }, [user, userData, loading, router]);
  
  useEffect(() => {
    if (!isMobile) {
      setOpen(false);
    }
  }, [isMobile]);

  if (loading || !user || userData?.role !== 'admin') {
    return (
       <div className="flex items-center justify-center h-screen bg-background">
          <p className="text-sm text-muted-foreground">Loading Admin Panel...</p>
       </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 flex-shrink-0 border-r bg-background hidden md:flex flex-col">
        <AdminNav onLinkClick={() => {}} />
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="md:hidden sticky top-0 z-10 flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur-sm">
             <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                    <AdminNav onLinkClick={() => setOpen(false)}/>
                </SheetContent>
            </Sheet>
             <h1 className="text-lg font-bold text-foreground tracking-tighter">Hasmi Admin</h1>
             <div></div>
        </header>
        <main className="flex-1 p-4 md:p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
