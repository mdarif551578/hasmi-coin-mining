

"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Repeat, Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useMarketplace } from "@/hooks/use-marketplace";
import { useAuth } from "@/lib/auth";
import { useUserData } from "@/hooks/use-user-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/hooks/use-settings";

export default function MarketplacePage() {
  const { user } = useAuth();
  const { userData, loading: userLoading } = useUserData();
  const { settings, loading: settingsLoading } = useSettings();
  const { listings, userBuyRequests, allPendingBuyRequests, loading: listingsLoading, createOffer, isSubmitting, buyOffer, hasMore, loadMoreListings, loadingMore, cancelOffer, cancelBuyRequest } = useMarketplace();

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !user || !userData.displayName) return;
    
    await createOffer({ 
      amount: parseFloat(amount), 
      rate: parseFloat(rate),
      userBalance: userData.wallet_balance,
      userDisplayName: userData.displayName
    });

    if (!isSubmitting) {
        setAmount("");
        setRate("");
        setOpen(false);
    }
  };

  const handleBuy = (listing: any) => {
    if (!userData) return;
    buyOffer(listing, userData.usd_balance);
  }

  const myPendingOffers = listings.filter(l => l.sellerId === user?.uid && l.status === 'pending');
  const myBuyRequests = userBuyRequests.filter(br => br.status === 'pending');
  const openSellOffers = listings.filter(l => l.status === 'open');
  const isLoading = listingsLoading || userLoading || settingsLoading;
  
  const officialUsdToHcRate = settings?.usd_to_hc || 0;
  const officialRatePerHc = officialUsdToHcRate > 0 ? (1 / officialUsdToHcRate) : 0;


  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-2">
        <h1 className="text-xl font-bold">P2P Marketplace</h1>
        <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
                <Link href="/exchange">
                    <Repeat className="size-4 mr-1" />
                    Exchange
                </Link>
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" disabled={isLoading}>
                <Plus className="size-4 mr-1" />
                Create Offer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Create a Sell Offer</DialogTitle>
                <DialogDescription>
                    Enter the amount of Hasmi Coin (HC) you want to sell and the rate. Your offer will be reviewed by an admin. Your available HC will be locked until the offer is fulfilled or cancelled.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-sm p-3 rounded-md bg-muted">
                        Available to sell: <span className="font-bold">{userData?.wallet_balance?.toLocaleString() || 0} HC</span>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amount">
                        Amount (HC)
                        </Label>
                        <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g. 500"
                        required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rate">
                        Rate ($/HC)
                        </Label>
                        <Input
                        id="rate"
                        type="number"
                        step="0.001"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        placeholder={`e.g. ${officialRatePerHc.toFixed(3)}`}
                        required
                        />
                    </div>
                    {officialUsdToHcRate > 0 && (
                        <div className="text-xs text-center text-muted-foreground">
                            Official app rate: 1 USD = {officialUsdToHcRate} HC (${officialRatePerHc.toFixed(3)}/HC)
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting || !amount || !rate} className="w-full">
                        {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                        Submit for Approval
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <>
          {myPendingOffers.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">My Pending Sell Offers</h2>
              <div className="space-y-3">
                {myPendingOffers.map(listing => (
                  <Card key={listing.id} className="rounded-xl bg-card-foreground/5">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg">{listing.amount.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">HC</span></p>
                        <p className="text-xs text-muted-foreground">
                          Rate: ${listing.rate.toFixed(3)} | Total: ${(listing.amount * listing.rate).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="capitalize text-xs">{listing.status}</Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={isSubmitting}>
                                    <Trash2 className="size-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently cancel your sell offer for {listing.amount.toLocaleString()} HC. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Back</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => cancelOffer(listing.id)} className="bg-destructive hover:bg-destructive/90">Cancel Offer</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

           {myBuyRequests.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">My Pending Buy Requests</h2>
              <div className="space-y-3">
                {myBuyRequests.map(request => (
                  <Card key={request.id} className="rounded-xl bg-card-foreground/5">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg">{request.amount.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">HC</span></p>
                        <p className="text-xs text-muted-foreground">
                          Total: ${request.totalPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="capitalize text-xs">Awaiting Approval</Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={isSubmitting}>
                                    <Trash2 className="size-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently cancel your buy request for {request.amount.toLocaleString()} HC. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Back</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => cancelBuyRequest(request)} className="bg-destructive hover:bg-destructive/90">Cancel Request</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}


          <div>
            <h2 className="text-lg font-semibold mb-2 mt-6">Open Sell Offers</h2>
            {openSellOffers.length > 0 ? (
                <div className="space-y-3">
                {openSellOffers.map(listing => {
                    const hasPendingBuy = allPendingBuyRequests.some(br => br.listingId === listing.id);

                    return (
                    <Card key={listing.id} className="rounded-xl overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-muted-foreground">Amount</p>
                                    <p className="font-bold text-xl">{listing.amount.toLocaleString()} <span className="text-base font-normal">HC</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Total Price</p>
                                    <p className="font-bold text-xl text-primary">${(listing.amount * listing.rate).toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2 flex justify-between items-center">
                                <span>Rate: ${listing.rate.toFixed(3)}/HC &middot; Seller: {listing.sellerName}</span>
                                {hasPendingBuy && (
                                    <Badge variant="secondary" className="text-xs">Sale Pending</Badge>
                                )}
                            </div>
                        </CardContent>
                        <div className="bg-card-foreground/5 p-3">
                            <Button 
                                className="w-full h-10" 
                                onClick={() => handleBuy(listing)} 
                                disabled={listing.sellerId === user?.uid || isSubmitting || hasPendingBuy}>
                                 {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                                 {listing.sellerId === user?.uid 
                                    ? "This is your offer" 
                                    : hasPendingBuy 
                                    ? "Sale Pending" 
                                    : "Buy Now"
                                 }
                            </Button>
                        </div>
                    </Card>
                )})}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No open offers at the moment.</p>
                </div>
            )}
             {(hasMore || loadingMore) && (
                <div className="flex justify-center mt-6">
                    <Button
                        variant="outline"
                        onClick={loadMoreListings}
                        disabled={loadingMore}
                    >
                        {loadingMore ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</> : 'Load More Offers'}
                    </Button>
                </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
