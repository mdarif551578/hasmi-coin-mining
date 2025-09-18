"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { user } from "@/lib/data";
import { Cog } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export function MiningStatusCard({ className }: { className?: string }) {
    return (
        <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Mining Status</CardTitle>
                <Cog className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-lg md:text-xl font-bold text-green-400">{user.miningStatus}</p>
                <p className="text-xs text-muted-foreground">Your mining rigs are online.</p>
                <Link href="/mining" className="mt-4 block">
                    <Button variant="outline" size="sm" className="w-full h-9">Go to Mining Center</Button>
                </Link>
            </CardContent>
        </Card>
    );
}
