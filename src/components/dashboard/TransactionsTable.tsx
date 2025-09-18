import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { transactions } from "@/lib/data";
import type { Transaction } from "@/lib/types";
import { ArrowDownLeft, ArrowUpRight, Cog, CheckSquare, Store, Users, HandCoins } from "lucide-react";
import { cn } from "@/lib/utils";

const TransactionIcon = ({ type }: { type: Transaction['type'] }) => {
    const iconMap = {
        deposit: <ArrowDownLeft className="size-4 text-green-400" />,
        withdraw: <ArrowUpRight className="size-4 text-red-400" />,
        mining: <Cog className="size-4 text-muted-foreground" />,
        task: <CheckSquare className="size-4 text-muted-foreground" />,
        'marketplace-sell': <Store className="size-4 text-muted-foreground" />,
        'marketplace-buy': <Store className="size-4 text-muted-foreground" />,
        referral: <Users className="size-4 text-muted-foreground" />,
    };
    return iconMap[type] || <HandCoins className="size-4 text-muted-foreground" />;
};

const getStatusBadgeVariant = (status: Transaction['status']): "default" | "secondary" | "destructive" => {
    switch (status) {
        case 'completed':
            return 'default';
        case 'pending':
            return 'secondary';
        case 'failed':
            return 'destructive';
    }
};

const isPositive = (type: Transaction['type']) => !['withdraw', 'marketplace-buy'].includes(type);

export function TransactionsTable({ className }: { className?: string }) {
    return (
        <Card className={cn("h-full flex flex-col rounded-2xl", className)}>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>A log of your recent wallet activity.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map(tx => (
                            <TableRow key={tx.id}>
                                <TableCell><TransactionIcon type={tx.type} /></TableCell>
                                <TableCell className="font-medium capitalize">{tx.type.replace('-', ' ')}</TableCell>
                                <TableCell className={cn(
                                    "font-semibold",
                                    isPositive(tx.type) ? "text-green-400" : "text-red-400"
                                )}>
                                    {isPositive(tx.type) ? '+' : '-'}{tx.amount.toFixed(2)} HC
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={getStatusBadgeVariant(tx.status)} className="capitalize">{tx.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
