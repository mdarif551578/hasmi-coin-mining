
'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useAdminActions } from '@/hooks/admin/use-admin-actions';
import { Check, X, ArrowRight } from 'lucide-react';
import type { BuyRequest, MarketListing } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminMarketplacePage() {
  const [pendingListings, setPendingListings] = useState<MarketListing[]>([]);
  const [pendingBuyRequests, setPendingBuyRequests] = useState<BuyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { loading: actionLoading, handleMarketListing, handleBuyRequest } = useAdminActions();

  useEffect(() => {
    const listingsQuery = query(collection(db, 'market_listings'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    const buyRequestsQuery = query(collection(db, 'buy_requests'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));

    const unsubListings = onSnapshot(listingsQuery, (snapshot) => {
      setPendingListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketListing)));
      setLoading(false);
    });
    
    const unsubBuyRequests = onSnapshot(buyRequestsQuery, (snapshot) => {
      setPendingBuyRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuyRequest)));
      setLoading(false);
    });

    return () => {
        unsubListings();
        unsubBuyRequests();
    };
  }, []);

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
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Seller ID</TableHead>
                                <TableHead>Amount (HC)</TableHead>
                                <TableHead>Rate ($/HC)</TableHead>
                                <TableHead>Total ($)</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && pendingListings.length === 0 ? (
                                <TableRow><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                            ) : pendingListings.length === 0 ? (
                                <TableRow className="md:table-row flex-col items-start"><TableCell colSpan={6} className="h-24 text-center block md:table-cell">No pending sell offers.</TableCell></TableRow>
                            ) : pendingListings.map(listing => (
                                <TableRow key={listing.id}>
                                    <TableCell data-label="Date">{format(listing.createdAt.toDate(), 'PP')}</TableCell>
                                    <TableCell data-label="Seller ID" className="font-mono text-xs">{listing.sellerId}</TableCell>
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
                </Card>
            </TabsContent>
            <TabsContent value="buy-requests">
                 <Card>
                    <CardHeader>
                        <CardTitle>Pending Buy Requests</CardTitle>
                        <CardDescription>Finalize P2P trades by approving or rejecting buy requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                            {loading && pendingBuyRequests.length === 0 ? (
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
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500" onClick={() => handleBuyRequest(req, 'approved')} disabled={actionLoading}><Check /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleBuyRequest(req, 'rejected')} disabled={actionLoading}><X /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
       </Tabs>
    </div>
  );
}
