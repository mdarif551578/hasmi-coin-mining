
'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, DocumentData, doc, updateDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useAdminActions } from '@/hooks/admin/use-admin-actions';
import { Check, X } from 'lucide-react';
import { increment } from 'firebase/firestore';

export default function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { loading: actionLoading, handleRequest } = useAdminActions();

  useEffect(() => {
    const q = query(collection(db, 'withdrawals'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests: DocumentData[] = [];
      snapshot.forEach(doc => {
        fetchedRequests.push({ id: doc.id, ...doc.data() });
      });
      setRequests(fetchedRequests);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

 const onAction = async (docId: string, action: 'approved' | 'rejected', userId: string, amount: number) => {
    // For withdrawals, we only need to update the status on approval. The balance was already checked.
    // On rejection, we need to return the funds.
    const updateData = action === 'rejected' ? { usd_balance: increment(amount) } : undefined;
    
     if (action === 'approved') {
        await handleRequest('withdrawals', docId, action);
    } else { // For rejection, we give the money back.
        const userDocRef = doc(db, 'users', userId);
        const reqDocRef = doc(db, 'withdrawals', docId);
        await runTransaction(db, async (transaction) => {
            transaction.update(reqDocRef, { status: 'rejected' });
            transaction.update(userDocRef, { usd_balance: increment(amount) });
        });
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
        <CardContent>
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
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : requests.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No pending withdrawal requests.
                    </TableCell>
                </TableRow>
              ) : requests.map(req => (
                <TableRow key={req.id}>
                  <TableCell>{req.createdAt ? format(req.createdAt.toDate(), 'PP') : 'N/A'}</TableCell>
                  <TableCell className="font-mono text-xs">{req.userId}</TableCell>
                  <TableCell className="font-semibold">${req.amount.toFixed(2)}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{req.method}</Badge></TableCell>
                  <TableCell>{req.accountInfo}</TableCell>
                  <TableCell className="text-right">
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
      </Card>
    </div>
  );
}
