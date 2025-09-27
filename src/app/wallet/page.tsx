
import { WalletCard } from '@/components/dashboard/WalletCard';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';

export default function WalletPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Wallet & Activity</h1>
      </div>
      <WalletCard />
      <TransactionsTable />
    </div>
  );
}
