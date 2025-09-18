import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { marketListings } from "@/lib/data";
import { Plus } from "lucide-react";

export default function MarketplacePage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold">P2P Marketplace</h1>
        <Button size="sm">
          <Plus className="mr-2" />
          Create Offer
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Open Sell Offers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seller</TableHead>
                  <TableHead>Amount (HC)</TableHead>
                  <TableHead>Rate ($/HC)</TableHead>
                  <TableHead className="text-right pr-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketListings.filter(l => l.status === 'open').map(listing => (
                  <TableRow key={listing.id}>
                    <TableCell>{listing.seller}</TableCell>
                    <TableCell>{listing.amount.toLocaleString()}</TableCell>
                    <TableCell>${listing.rate.toFixed(3)}</TableCell>
                    <TableCell className="text-right pr-4">
                      <Button size="sm">Buy</Button>
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
