
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, ArrowDownLeft, ArrowUpRight, Repeat, Store, CheckSquare, Settings, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/deposits", label: "Deposits", icon: ArrowDownLeft },
    { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpRight },
    { href: "/admin/exchanges", label: "Exchanges", icon: Repeat },
    { href: "/admin/marketplace", label: "Marketplace", icon: Store },
    { href: "/admin/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav({ onLinkClick }: { onLinkClick?: () => void }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <h1 className="text-xl font-bold text-foreground tracking-tighter">Hasmi Admin</h1>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onLinkClick}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            pathname.startsWith(item.href)
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t mt-auto">
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
