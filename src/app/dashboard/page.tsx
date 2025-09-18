import { TransactionsTable } from '@/components/dashboard/TransactionsTable';
import { WalletCard } from '@/components/dashboard/WalletCard';
import { ReferralCard } from '@/components/dashboard/ReferralCard';
import { MiningStatusCard } from '@/components/dashboard/MiningStatusCard';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <WalletCard />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReferralCard />
        <MiningStatusCard />
      </div>
      <TransactionsTable />
    </div>
  );
}
