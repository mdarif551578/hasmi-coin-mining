
'use client';
import React, { useMemo } from 'react';
import { orderBy, doc, updateDoc, runTransaction, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Check, X, Gem, ShoppingCart } from 'lucide-react';
import { useAdminPagination } from '@/hooks/admin/use-admin-pagination';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { PlanPurchaseRequest } from '@/lib/types';


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

export default function AdminPlanPurchasesPage() {
  const queryConstraints = useMemo(() => [orderBy('createdAt', 'desc')], []);
  const { data, loading, nextPage, prevPage, currentPage, canNext, canPrev } = useAdminPagination('plan_purchases', queryConstraints);
  const [actionLoading, setActionLoading] = React.useState(false);
  const { toast } = useToast();

  const requests = data.filter((req): req is PlanPurchaseRequest => req.status === 'pending');

 const onAction = async (req: PlanPurchaseRequest, action: 'approved' | 'rejected') => {
    setActionLoading(true);
    const reqRef = doc(db, 'plan_purchases', req.id);
    const userRef = doc(db, 'users', req.userId);

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) throw new Error("User not found");

            if (action === 'approved') {
                 if (userDoc.data().usd_balance < req.cost) {
                    throw new Error("User has insufficient funds.");
                }
                
                transaction.update(reqRef, { status: 'approved' });
                
                const userUpdateData: any = {
                    usd_balance: increment(-req.cost)
                };

                if (req.planType === 'paid') {
                    userUpdateData.mining_plan = req.planName;
                }
                
                // For NFT plans, we might just record the purchase.
                // The actual profit logic would happen elsewhere, perhaps via a scheduled function or when user claims.
                // For now, we just deduct the cost.

                transaction.update(userRef, userUpdateData);

            } else { // Rejected
                transaction.update(reqRef, { status: 'rejected' });
            }
        });

        toast({ title: 'Success', description: `Request has been ${action}.` });
    } catch (error: any) {
        console.error("Error handling plan purchase:", error);
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Plan Purchase Requests</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pending Purchases</CardTitle>
          <CardDescription>Review and process pending mining & NFT plan purchases from users.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Cost</TableHead>
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
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No pending plan purchase requests.
                    </TableCell>
                </TableRow>
              ) : requests.map(req => (
                <TableRow key={req.id}>
                  <TableCell data-label="Date">{req.createdAt ? format(req.createdAt.toDate(), 'PP') : 'N/A'}</TableCell>
                  <TableCell data-label="User ID" className="font-mono text-xs">{req.userId}</TableCell>
                  <TableCell data-label="Plan Name" className="font-medium">{req.planName}</TableCell>
                  <TableCell data-label="Plan Type">
                    <Badge variant="outline" className="capitalize">
                      {req.planType === 'paid' ? <ShoppingCart className="size-3 mr-1.5" /> : <Gem className="size-3 mr-1.5" />}
                      {req.planType}
                    </Badge>
                  </TableCell>
                  <TableCell data-label="Cost" className="font-semibold">${req.cost.toFixed(2)}</TableCell>
                  <TableCell data-label="Actions" className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:text-green-600" onClick={() => onAction(req, 'approved')} disabled={actionLoading}>
                        <Check />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => onAction(req, 'rejected')} disabled={actionLoading}>
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

