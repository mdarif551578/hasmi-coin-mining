import { AppSidebar } from '@/components/AppSidebar';
import { MiningSection } from '@/components/dashboard/MiningSection';
import { ReferralCard } from '@/components/dashboard/ReferralCard';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';
import { WalletCard } from '@/components/dashboard/WalletCard';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function Dashboard() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WalletCard />
                <ReferralCard />
              </div>
              <MiningSection />
            </div>
            <div className="lg:col-span-1">
              <TransactionsTable className="h-full"/>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
