
'use client';
import React from 'react';
import { useMemo } from 'react';
import { where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useAdminActions } from '@/hooks/admin/use-admin-actions';
import { Check, X } from 'lucide-react';
import type { BuyRequest } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

export default function AdminMarketplacePage() {
    const listingsQuery = useMemo(() => [where('status', '==', 'pending'), orderBy('createdAt', 'desc')], []);
    const buyRequestsQuery = useMemo(() => [where('status', '==', 'pending'), orderBy('createdAt', 'desc')], []);

    const { data: pendingListings, loading: loadingListings, nextPage: nextListings, prevPage: prevListings, currentPage: currentListingsPage, canNext: canNextListings, canPrev: canPrevListings } = useAdminPagination('market_listings', listingsQuery);
    const { data: pendingBuyRequests, loading: loadingBuyRequests, nextPage: nextBuyReqs, prevPage: prevBuyReqs, currentPage: currentBuyReqsPage, canNext: canNextBuyReqs, canPrev: canPrevBuyReqs } = useAdminPagination('buy_requests', buyRequestsQuery);
    
    const { loading: actionLoading, handleMarketListing, handleBuyRequest } = useAdminActions();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Marketplace Management</h1>
       <Tabs defaultValue="listings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="listings">Pending Sell Offers</TabsTrigger>
              <TabsTrigger value="buy-requests">Pending Buy Requests</TabsTrigger>
            </TabsList>
            <TabsContent value="listings">
                 <Card>
                    <CardHeader>
                        <CardTitle>Pending Sell Offers</CardTitle>
                        <CardDescription>Approve or reject new sell offers created by users.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Seller ID</TableHead>
                                <TableHead>Seller Name</TableHead>
                                <TableHead>Amount (HC)</TableHead>
                                <TableHead>Rate ($/HC)</TableHead>
                                <TableHead>Total ($)</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingListings && pendingListings.length === 0 ? (
                                <TableRow><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                            ) : pendingListings.length === 0 ? (
                                <TableRow className="md:table-row flex-col items-start"><TableCell colSpan={7} className="h-24 text-center block md:table-cell">No pending sell offers.</TableCell></TableRow>
                            ) : pendingListings.map(listing => (
                                <TableRow key={listing.id}>
                                    <TableCell data-label="Date">{format(listing.createdAt.toDate(), 'PP')}</TableCell>
                                    <TableCell data-label="Seller ID" className="font-mono text-xs">{listing.sellerId}</TableCell>
                                    <TableCell data-label="Seller Name">{listing.sellerName}</TableCell>
                                    <TableCell data-label="Amount">{listing.amount.toLocaleString()} HC</TableCell>
                                    <TableCell data-label="Rate">${listing.rate.toFixed(3)}</TableCell>
                                    <TableCell data-label="Total">${(listing.amount * listing.rate).toFixed(2)}</TableCell>
                                    <TableCell data-label="Actions" className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500" onClick={() => handleMarketListing(listing.id, 'open')} disabled={actionLoading}><Check /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleMarketListing(listing.id, 'rejected')} disabled={actionLoading}><X /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </CardContent>
                     <CardFooter className="justify-end">
                        <PaginationControls
                            canPrev={canPrevListings}
                            canNext={canNextListings}
                            currentPage={currentListingsPage}
                            onPrev={prevListings}
                            onNext={nextListings}
                            loading={loadingListings}
                        />
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="buy-requests">
                 <Card>
                    <CardHeader>
                        <CardTitle>Pending Buy Requests</CardTitle>
                        <CardDescription>Finalize P2P trades by approving or rejecting buy requests.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Buyer ID</TableHead>
                                <TableHead>Seller ID</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingBuyRequests && pendingBuyRequests.length === 0 ? (
                                <TableRow><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                            ) : pendingBuyRequests.length === 0 ? (
                                <TableRow className="md:table-row flex-col items-start"><TableCell colSpan={5} className="h-24 text-center block md:table-cell">No pending buy requests.</TableCell></TableRow>
                            ) : pendingBuyRequests.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell data-label="Date">{format(req.createdAt.toDate(), 'PP')}</TableCell>
                                    <TableCell data-label="Buyer ID" className="font-mono text-xs">{req.buyerId}</TableCell>
                                    <TableCell data-label="Seller ID" className="font-mono text-xs">{req.sellerId}</TableCell>
                                    <TableCell data-label="Amount">
                                        {req.amount.toLocaleString()} HC for ${req.totalPrice.toFixed(2)}
                                    </TableCell>
                                    <TableCell data-label="Actions" className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500" onClick={() => handleBuyRequest(req as BuyRequest, 'approved')} disabled={actionLoading}><Check /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleBuyRequest(req as BuyRequest, 'rejected')} disabled={actionLoading}><X /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </CardContent>
                     <CardFooter className="justify-end">
                        <PaginationControls
                            canPrev={canPrevBuyReqs}
                            canNext={canNextBuyReqs}
                            currentPage={currentBuyReqsPage}
                            onPrev={prevBuyReqs}
                            onNext={nextBuyReqs}
                            loading={loadingBuyRequests}
                        />
                    </CardFooter>
                </Card>
            </TabsContent>
       </Tabs>
    </div>
  );
}
