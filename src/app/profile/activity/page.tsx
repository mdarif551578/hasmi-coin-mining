
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ActivityLogPage() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
       <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-9 h-9" asChild>
            <Link href="/profile">
                <ChevronLeft />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">Activity Log</h1>
       </div>
      <TransactionsTable />
    </div>
  );
}
