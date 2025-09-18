"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Cog, CheckSquare, User, Wallet, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/mining", icon: Cog, label: "Mine" },
  { href: "/wallet", icon: Wallet, label: "Wallet" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/marketplace", icon: Store, label: "Market" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t border-border/50">
        <div className="grid h-full max-w-lg grid-cols-6 mx-auto font-medium" />
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t border-border/50">
      <div className="grid h-full max-w-lg grid-cols-6 mx-auto font-medium">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex flex-col items-center justify-center px-5 hover:bg-accent/50 group transition-colors h-full",
              "text-xs",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
