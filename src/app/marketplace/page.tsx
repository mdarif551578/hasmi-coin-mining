import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { marketListings } from "@/lib/data";
import { Plus } from "lucide-react";

export default function MarketplacePage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg md:text-xl font-bold">P2P Marketplace</h1>
        <Button size="sm">
          <Plus className="mr-2" />
          Create Offer
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Open Sell Offers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Seller</TableHead>
                  <TableHead>Amount (HC)</TableHead>
                  <TableHead>Rate ($/HC)</TableHead>
                  <TableHead className="text-right pr-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketListings.filter(l => l.status === 'open').map(listing => (
                  <TableRow key={listing.id}>
                    <TableCell className="pl-4">{listing.seller}</TableCell>
                    <TableCell>{listing.amount.toLocaleString()}</TableCell>
                    <TableCell>${listing.rate.toFixed(3)}</TableCell>
                    <TableCell className="text-right pr-4">
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
