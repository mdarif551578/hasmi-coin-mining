import { WalletCard } from '@/components/dashboard/WalletCard';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';

export default function WalletPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <WalletCard />
      <TransactionsTable />
    </div>
  );
}
