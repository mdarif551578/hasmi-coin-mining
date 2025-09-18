import { WalletCard } from "@/components/dashboard/WalletCard";
import { MiningSection } from "@/components/dashboard/MiningSection";
import { ReferralCard } from "@/components/dashboard/ReferralCard";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { user } from "@/lib/data";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome, {user.name}!</h1>
          <p className="text-muted-foreground">Your mining dashboard is ready.</p>
        </div>
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <WalletCard />
                <ReferralCard />
            </div>
            <MiningSection />
        </div>
        <div className="lg:col-span-1">
            <TransactionsTable />
        </div>
      </div>
    </div>
  );
}
