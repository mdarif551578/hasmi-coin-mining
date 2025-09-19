"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const depositPackages = [
    { usd: 10, hc: 1100 },
    { usd: 20, hc: 2200 },
    { usd: 50, hc: 5500 },
    { usd: 100, hc: 11000 },
]

export default function DepositPage() {
    const { toast } = useToast();
    const [amount, setAmount] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [transactionId, setTransactionId] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Deposit Request Submitted",
            description: "Your deposit request has been received. Please wait for admin approval.",
        });
        setAmount("");
        setPhoneNumber("");
        setTransactionId("");
    };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
       <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Deposit</h1>
       </div>
       <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Token Price</CardTitle>
          <CardDescription>Current market rate for Hasmi Coin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            <p className="text-xl font-bold text-center">1 HC = $0.009 USD</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {depositPackages.map((pkg) => (
                    <div key={pkg.usd} className="p-2 text-center rounded-lg bg-muted/50">
                        <p className="text-sm font-bold">${pkg.usd}</p>
                        <p className="text-xs text-primary">{pkg.hc.toLocaleString()} HC</p>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Deposit Funds</CardTitle>
          <CardDescription>
            Add funds to your wallet using bKash or Nagad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bkash" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bkash">bKash</TabsTrigger>
              <TabsTrigger value="nagad">Nagad</TabsTrigger>
            </TabsList>
            <TabsContent value="bkash">
              <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm">
                <p>Please complete your bKash payment to agent number:</p>
                <p className="font-bold text-lg my-1">01XXXXXXXXX</p>
                <p>Then, fill the form below.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="bkash-amount">Amount (HC)</Label>
                  <Input id="bkash-amount" placeholder="e.g. 500" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bkash-phone">Your bKash Phone Number</Label>
                  <Input id="bkash-phone" placeholder="e.g. 01XXXXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bkash-trx">bKash Transaction ID (TrxID)</Label>
                  <Input id="bkash-trx" placeholder="e.g. 8M7A9B2C1D" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full">Submit Deposit Request</Button>
              </form>
            </TabsContent>
            <TabsContent value="nagad">
                <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm">
                    <p>Please complete your Nagad payment to agent number:</p>
                    <p className="font-bold text-lg my-1">01XXXXXXXXX</p>
                    <p>Then, fill the form below.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="nagad-amount">Amount (HC)</Label>
                        <Input id="nagad-amount" placeholder="e.g. 500" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nagad-phone">Your Nagad Phone Number</Label>
                        <Input id="nagad-phone" placeholder="e.g. 01XXXXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nagad-trx">Nagad Transaction ID (TrxID)</Label>
                        <Input id="nagad-trx" placeholder="e.g. 8M7A9B2C1D" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full">Submit Deposit Request</Button>
                </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
