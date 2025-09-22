
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/lib/types";
import { ArrowDownLeft, ArrowUpRight, Cog, CheckSquare, Store, Users, HandCoins, Gem, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/use-transactions";
import { Skeleton } from "../ui/skeleton";

const TransactionIcon = ({ type }: { type: Transaction['type'] }) => {
    const iconMap = {
        deposit: <ArrowDownLeft className="size-4 text-green-400" />,
        withdraw: <ArrowUpRight className="size-4 text-red-400" />,
        mining: <Cog className="size-4 text-muted-foreground" />,
        task: <CheckSquare className="size-4 text-muted-foreground" />,
        exchange: <Repeat className="size-4 text-muted-foreground" />,
        'marketplace-sell': <Store className="size-4 text-muted-foreground" />,
        'marketplace-buy': <Store className="size-4 text-muted-foreground" />,
        referral: <Users className="size-4 text-primary" />,
        'nft-reward': <Gem className="size-4 text-primary" />,
    };
    return iconMap[type] || <HandCoins className="size-4 text-muted-foreground" />;
};

const getStatusBadgeVariant = (status: Transaction['status']): "default" | "secondary" | "destructive" => {
    switch (status) {
        case 'completed':
        case 'approved':
            return 'default';
        case 'pending':
            return 'secondary';
        case 'failed':
        case 'rejected':
            return 'destructive';
        default:
            return 'secondary';
    }
};

const isPositive = (type: Transaction['type'], currency: Transaction['currency']) => {
    if (currency === 'USD') {
        return type === 'deposit';
    }
    // Assume HC for others
    return !['withdraw', 'marketplace-buy', 'exchange'].includes(type);
};

export function TransactionsTable({ className, limit }: { className?: string, limit?: number }) {
    const { transactions, loading } = useTransactions();
    const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

    return (
        <Card className={cn("h-full flex flex-col rounded-2xl", className)}>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>A log of your recent wallet activity.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                 <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px] pl-4"></TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead className="text-right pr-4">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: limit || 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="pl-4 py-3"><Skeleton className="w-5 h-5 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="w-20 h-4" /></TableCell>
                                        <TableCell><Skeleton className="w-24 h-4" /></TableCell>
                                        <TableCell className="text-right pr-4"><Skeleton className="w-16 h-5 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : displayTransactions.length > 0 ? (
                                displayTransactions.map(tx => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="pl-4 py-2"><TransactionIcon type={tx.type} /></TableCell>
                                        <TableCell className="font-medium capitalize text-sm py-2">{tx.type.replace('-', ' ')}</TableCell>
                                        <TableCell className={cn(
                                            "font-semibold text-sm py-2",
                                            isPositive(tx.type, tx.currency) ? "text-green-400" : "text-red-400"
                                        )}>
                                            {isPositive(tx.type, tx.currency) ? '+' : '-'}{tx.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {tx.currency}
                                        </TableCell>
                                        <TableCell className="text-right pr-4 py-2">
                                            <Badge variant={getStatusBadgeVariant(tx.status)} className="capitalize text-xs">{tx.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No transactions yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
