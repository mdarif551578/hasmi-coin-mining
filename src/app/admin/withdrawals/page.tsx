
'use client';
import React from 'react';
import { collection, onSnapshot, query, where, orderBy, DocumentData, doc, updateDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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

export default function AdminWithdrawalsPage() {
  const { data: requests, loading, nextPage, prevPage, currentPage, canNext, canPrev } = useAdminPagination('withdrawals', [where('status', '==', 'pending'), orderBy('createdAt', 'desc')]);
  const { loading: actionLoading, handleRequest } = useAdminActions();

 const onAction = async (docId: string, action: 'approved' | 'rejected', userId: string, amount: number) => {
    if (action === 'approved') {
        await handleRequest('withdrawals', docId, action, userId);
    } else { // For rejection, we give the money back.
        const userDocRef = doc(db, 'users', userId);
        const reqDocRef = doc(db, 'withdrawals', docId);
        try {
            await runTransaction(db, async (transaction) => {
                transaction.update(reqDocRef, { status: 'rejected' });
                transaction.update(userDocRef, { usd_balance: increment(amount) });
            });
        } catch (error) {
            console.error("Failed to reject withdrawal:", error)
        }
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Withdrawal Requests</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pending Withdrawals</CardTitle>
          <CardDescription>Review and process pending withdrawal requests from users.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Account Info</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && requests.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : requests.length === 0 ? (
                 <TableRow className="md:table-row flex-col items-start">
                    <TableCell colSpan={6} className="h-24 text-center block md:table-cell">
                        No pending withdrawal requests.
                    </TableCell>
                </TableRow>
              ) : requests.map(req => (
                <TableRow key={req.id}>
                  <TableCell data-label="Date">{req.createdAt ? format(req.createdAt.toDate(), 'PP') : 'N/A'}</TableCell>
                  <TableCell data-label="User ID" className="font-mono text-xs">{req.userId}</TableCell>
                  <TableCell data-label="Amount" className="font-semibold">${req.amount.toFixed(2)}</TableCell>
                  <TableCell data-label="Method"><Badge variant="outline" className="capitalize">{req.method}</Badge></TableCell>
                  <TableCell data-label="Account Info">{req.accountInfo}</TableCell>
                  <TableCell data-label="Actions" className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:text-green-600" onClick={() => onAction(req.id, 'approved', req.userId, req.amount)} disabled={actionLoading}>
                        <Check />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => onAction(req.id, 'rejected', req.userId, req.amount)} disabled={actionLoading}>
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
