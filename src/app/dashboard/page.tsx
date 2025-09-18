import { MiningSection } from '@/components/dashboard/MiningSection';
import { ReferralCard } from '@/components/dashboard/ReferralCard';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';
import { WalletCard } from '@/components/dashboard/WalletCard';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <WalletCard />
      <ReferralCard />
      <MiningSection />
      <TransactionsTable />
    </div>
  );
}
