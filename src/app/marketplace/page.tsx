
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { marketListings, user } from "@/lib/data";
import { Plus, Repeat } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function MarketplacePage() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically lock the user's funds
    // and send the offer to the backend for admin approval.
    toast({
      title: "Offer Submitted",
      description: "Your sell offer has been submitted for admin approval.",
    });
    setAmount("");
    setRate("");
    setOpen(false);
  };

  const myPendingOffers = marketListings.filter(l => l.seller === user.name && l.status === 'pending');
  const openSellOffers = marketListings.filter(l => l.status === 'open');

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center gap-2">
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
                <Button size="sm">
                <Plus className="size-4 mr-1" />
                Create
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Create a Sell Offer</DialogTitle>
                <DialogDescription>
                    Enter the amount of Hasmi Coin (HC) you want to sell and the rate. Your offer will be reviewed by an admin.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                    Amount (HC)
                    </Label>
                    <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g. 500"
                    required
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rate" className="text-right">
                    Rate ($/HC)
                    </Label>
                    <Input
                    id="rate"
                    type="number"
                    step="0.001"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g. 0.01"
                    required
                    />
                </div>
                <DialogFooter>
                    <Button type="submit">Submit for Approval</Button>
                </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
        </div>
      </div>
      
      {myPendingOffers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">My Pending Offers</h2>
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
                  <Badge variant="secondary" className="capitalize text-xs">{listing.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-2">Open Sell Offers</h2>
        <div className="space-y-3">
          {openSellOffers.map(listing => (
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
                    <div className="text-xs text-muted-foreground mt-2">
                        <span>Rate: ${listing.rate.toFixed(3)}/HC</span> &middot; <span>Seller: {listing.seller}</span>
                    </div>
                </CardContent>
                <div className="bg-card-foreground/5 p-3">
                    <Button className="w-full h-10">Buy Now</Button>
                </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
