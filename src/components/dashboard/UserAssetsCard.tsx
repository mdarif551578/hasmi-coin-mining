
'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Gem } from "lucide-react";
import { useUserAssets } from "@/hooks/use-user-assets";
import { add, format } from 'date-fns';

export function UserAssetsCard() {
  const { nfts, loading: assetsLoading } = useUserAssets();

  const calculateEndDate = (startDate: Date, durationString: string): Date => {
    const durationParts = durationString.split(' ');
    const durationValue = parseInt(durationParts[0], 10);
    const durationUnit = durationParts[1].toLowerCase();

    const duration = { [durationUnit]: durationValue };
    return add(startDate, duration);
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Gem className="size-4 text-muted-foreground" />
          My Assets
          {assetsLoading ? <Skeleton className="w-8 h-6" /> : <Badge>{nfts.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-48 overflow-y-auto">
        {assetsLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : nfts.length > 0 ? (
          nfts.map((nft) => {
            const startDate = nft.createdAt?.toDate();
            const endDate = startDate ? calculateEndDate(startDate, nft.duration || '0 days') : null;

            return (
            <div key={nft.id} className="p-3 bg-card-foreground/5 rounded-lg">
              <p className="font-semibold text-sm">{nft.planName}</p>
              <div className="flex justify-between items-end text-xs text-muted-foreground">
                  <span>Cost: ${nft.cost.toFixed(2)}</span>
                  <span className="text-primary font-medium">Return: ${(nft.cost + (nft.profit || 0)).toFixed(2)}</span>
              </div>
               {endDate && (
                <div className="text-xs text-muted-foreground mt-1">
                    Ends on: {format(endDate, 'PP')}
                </div>
              )}
            </div>
          )})
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">You do not own any NFT assets yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
