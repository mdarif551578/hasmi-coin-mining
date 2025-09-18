import { WalletCard } from '@/components/dashboard/WalletCard';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';

export default function WalletPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <WalletCard />
      <TransactionsTable />
    </div>
  );
}