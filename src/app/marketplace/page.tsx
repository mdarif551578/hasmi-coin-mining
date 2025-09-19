
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { marketListings, user } from "@/lib/data";
import { Plus } from "lucide-react";
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

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">P2P Marketplace</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2" />
              Create Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create a Sell Offer</DialogTitle>
              <DialogDescription>
                Enter the amount of Hasmi Coin (HC) you want to sell and the rate you want to sell it at. Your offer will be reviewed by an admin before it is listed.
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
      
      {myPendingOffers.length > 0 && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>My Pending Offers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Amount (HC)</TableHead>
                    <TableHead>Rate ($/HC)</TableHead>
                    <TableHead>Total ($)</TableHead>
                    <TableHead className="text-right pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myPendingOffers.map(listing => (
                    <TableRow key={listing.id}>
                      <TableCell className="pl-6 py-3">{listing.amount.toLocaleString()}</TableCell>
                      <TableCell className="py-3">${listing.rate.toFixed(3)}</TableCell>
                      <TableCell className="py-3 font-semibold">${(listing.amount * listing.rate).toFixed(2)}</TableCell>
                      <TableCell className="text-right pr-6 py-3">
                        <Badge variant="secondary" className="capitalize text-xs">{listing.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Open Sell Offers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Seller</TableHead>
                  <TableHead>Amount (HC)</TableHead>
                  <TableHead>Rate ($/HC)</TableHead>
                  <TableHead>Total ($)</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketListings.filter(l => l.status === 'open').map(listing => (
                  <TableRow key={listing.id}>
                    <TableCell className="pl-6 py-3">{listing.seller}</TableCell>
                    <TableCell className="py-3">{listing.amount.toLocaleString()}</TableCell>
                    <TableCell className="py-3">${listing.rate.toFixed(3)}</TableCell>
                    <TableCell className="py-3 font-semibold">${(listing.amount * listing.rate).toFixed(2)}</TableCell>
                    <TableCell className="text-right pr-6 py-3">
                      <Button size="sm" className="h-8 px-2 text-xs">Buy</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
