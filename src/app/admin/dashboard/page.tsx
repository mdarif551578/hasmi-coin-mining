
'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAdminDashboard } from "@/hooks/admin/use-admin-dashboard";
import { ArrowDownLeft, ArrowUpRight, CheckSquare, Loader2, Repeat, Store, Users } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
    const { counts, loading } = useAdminDashboard();

    const StatCard = ({ title, value, icon: Icon, href, isLoading }: { title: string, value: number, icon: React.ElementType, href: string, isLoading: boolean }) => (
        <Link href={href}>
            <Card className="hover:bg-accent hover:text-accent-foreground transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <div className="text-2xl font-bold">{value}</div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            <div className="text-2xl font-bold">{counts.totalUsers}</div>
                        )}
                    </CardContent>
                </Card>
                <StatCard title="Pending Deposits" value={counts.pendingDeposits} icon={ArrowDownLeft} href="/admin/deposits" isLoading={loading} />
                <StatCard title="Pending Withdrawals" value={counts.pendingWithdrawals} icon={ArrowUpRight} href="/admin/withdrawals" isLoading={loading} />
                <StatCard title="Pending Exchanges" value={counts.pendingExchanges} icon={Repeat} href="/admin/exchanges" isLoading={loading} />
                <StatCard title="Pending Listings" value={counts.pendingListings} icon={Store} href="/admin/marketplace" isLoading={loading} />
                 <StatCard title="Pending Buy Requests" value={counts.pendingBuyRequests} icon={Store} href="/admin/marketplace" isLoading={loading} />
                 <StatCard title="Pending Task Submissions" value={counts.pendingTaskSubmissions} icon={CheckSquare} href="/admin/tasks" isLoading={loading} />
            </div>
        </div>
    );
}
