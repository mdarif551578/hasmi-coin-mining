
'use client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUserData } from '@/hooks/use-user-data';
import { AdminNav } from '@/components/admin/AdminNav';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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
    // Only run the effect if loading is complete
    if (!loading) {
      // If there's no user OR the user is not an admin, redirect to login.
      // This handles the case where a non-admin tries to access /admin URLs.
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

  // While loading, or if the user is not yet confirmed as an admin, show a loading screen.
  // This prevents the flicker of content and ensures all data is present before rendering.
  if (loading || !user || userData?.role !== 'admin') {
    return (
       <div className="flex items-center justify-center h-screen bg-background">
          <p className="text-sm text-muted-foreground">Loading Admin Panel...</p>
       </div>
    );
  }

  // If loading is complete and user is an admin, render the layout
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
                    <SheetHeader>
                      <SheetTitle className="sr-only">Admin Menu</SheetTitle>
                    </SheetHeader>
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
