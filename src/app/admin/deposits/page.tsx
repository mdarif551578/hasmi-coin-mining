
'use client';
import React, { useMemo } from 'react';
import { orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useAdminActions } from '@/hooks/admin/use-admin-actions';
import { Check, X } from 'lucide-react';
import { increment } from 'firebase/firestore';
import { useAdminPagination } from '@/hooks/admin/use-admin-pagination';

const PaginationControls = ({ canPrev, canNext, currentPage, onPrev, onNext, loading }: { canPrev: boolean, canNext: boolean, currentPage: number, onPrev: () => void, onNext: () => void, loading: boolean }) => (
    <div className="flex items-center justify-end space-x-2 py-4">
        <span className="text-sm text-muted-foreground">Page {currentPage}</span>
        <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
            disabled={!canPrev || loading}
        >
            Previous
        </Button>
        <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={!canNext || loading}
        >
            Next
        </Button>
    </div>
);

export default function AdminDepositsPage() {
  const queryConstraints = useMemo(() => [orderBy('createdAt', 'desc')], []);
  const { data, loading, nextPage, prevPage, currentPage, canNext, canPrev } = useAdminPagination('deposits', queryConstraints);
  const { loading: actionLoading, handleRequest } = useAdminActions();

  const requests = data.filter(req => req.status === 'pending');

  const onAction = (docId: string, action: 'approved' | 'rejected', amount: number, userId: string) => {
    const updateData = action === 'approved' ? { usd_balance: increment(amount) } : undefined;
    handleRequest('deposits', docId, action, userId, updateData);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Deposit Requests</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pending Deposits</CardTitle>
          <CardDescription>Review and process pending deposit requests from users.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && requests.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : requests.length === 0 ? (
                 <TableRow className="md:table-row flex-col items-start">
                    <TableCell colSpan={7} className="h-24 text-center w-full block md:table-cell">
                        No pending deposit requests.
                    </TableCell>
                </TableRow>
              ) : requests.map(req => (
                <TableRow key={req.id}>
                  <TableCell data-label="Date">{req.createdAt ? format(req.createdAt.toDate(), 'PP') : 'N/A'}</TableCell>
                  <TableCell data-label="User ID" className="font-mono text-xs">{req.userId}</TableCell>
                  <TableCell data-label="Amount" className="font-semibold">${req.amount.toFixed(2)}</TableCell>
                  <TableCell data-label="Method"><Badge variant="outline" className="capitalize">{req.method}</Badge></TableCell>
                  <TableCell data-label="Phone Number">{req.phoneNumber}</TableCell>
                  <TableCell data-label="Transaction ID">{req.transactionId}</TableCell>
                  <TableCell data-label="Actions" className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:text-green-600" onClick={() => onAction(req.id, 'approved', req.amount, req.userId)} disabled={actionLoading}>
                        <Check />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => onAction(req.id, 'rejected', req.amount, req.userId)} disabled={actionLoading}>
                        <X />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter className="justify-end">
            <PaginationControls
                canPrev={canPrev}
                canNext={canNext}
                currentPage={currentPage}
                onPrev={prevPage}
                onNext={nextPage}
                loading={loading}
            />
        </CardFooter>
      </Card>
    </div>
  );
}
