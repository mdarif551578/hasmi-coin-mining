
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Repeat, CheckSquare, Store, User, Cog } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/mining", icon: Cog, label: "Mine" },
  { href: "/exchange", icon: Repeat, label: "Exchange" },
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
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium" />
      </div>
    );
  }
  
  const visibleItems = navItems.slice(0, 5);

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t border-border/50">
      <div className={`grid h-full max-w-lg grid-cols-5 mx-auto font-medium`}>
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex flex-col items-center justify-center px-1 hover:bg-accent/50 group transition-colors h-full",
              "text-xs",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs text-center">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
