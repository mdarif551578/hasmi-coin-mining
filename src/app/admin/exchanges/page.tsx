
'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useAdminActions } from '@/hooks/admin/use-admin-actions';
import { Check, X, ArrowRight } from 'lucide-react';
import { increment } from 'firebase/firestore';

export default function AdminExchangesPage() {
  const [requests, setRequests] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { loading: actionLoading, handleRequest } = useAdminActions();

  useEffect(() => {
    const q = query(collection(db, 'exchange_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests: DocumentData[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'pending') {
          fetchedRequests.push({ id: doc.id, ...data });
        }
      });
      setRequests(fetchedRequests);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const onAction = (docId: string, action: 'approved' | 'rejected', req: DocumentData) => {
    const updateData = action === 'approved' ? {
        usd_balance: increment(-req.usdAmount),
        wallet_balance: increment(req.hcAmount)
    } : {
        usd_balance: increment(req.usdAmount), // Return USD on rejection
    };

    handleRequest('exchange_requests', docId, action, updateData);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Exchange Requests</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pending Exchanges</CardTitle>
          <CardDescription>Review and process pending USD to HC exchanges from users.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Exchange</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : requests.length === 0 ? (
                <TableRow className="md:table-row flex-col items-start">
                    <TableCell colSpan={5} className="h-24 text-center block md:table-cell">
                        No pending exchange requests.
                    </TableCell>
                </TableRow>
              ) : requests.map(req => (
                <TableRow key={req.id}>
                  <TableCell data-label="Date">{req.createdAt ? format(req.createdAt.toDate(), 'PP') : 'N/A'}</TableCell>
                  <TableCell data-label="User ID" className="font-mono text-xs">{req.userId}</TableCell>
                  <TableCell data-label="Exchange" className="font-semibold flex items-center gap-2">
                    <span>${req.usdAmount.toFixed(2)}</span>
                    <ArrowRight className="size-4 text-muted-foreground" />
                    <span>{req.hcAmount.toLocaleString()} HC</span>
                  </TableCell>
                  <TableCell data-label="Rate">1 USD = {req.rate} HC</TableCell>
                  <TableCell data-label="Actions" className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:text-green-600" onClick={() => onAction(req.id, 'approved', req)} disabled={actionLoading}>
                        <Check />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => onAction(req.id, 'rejected', req)} disabled={actionLoading}>
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
