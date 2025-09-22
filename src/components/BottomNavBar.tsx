
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Repeat, CheckSquare, Store, User, Cog, Home as HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Message } from "@/lib/types";

const navItems = [
  { href: "/dashboard", icon: HomeIcon, label: "Home" },
  { href: "/mining", icon: Cog, label: "Mine" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/marketplace", icon: Store, label: "Market" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "messages"), 
        where("userId", "==", user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const hasUnreadMessages = snapshot.docs
          .map(doc => doc.data() as Message)
          .some(msg => !msg.isRead && msg.senderId === 'admin');
        setHasUnread(hasUnreadMessages);
      });
      return () => unsubscribe();
    }
  }, [user]);

  if (!isClient) {
    return (
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t border-border/50">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium" />
      </div>
    );
  }

  // A bit of a hack to handle the / dashboard redirect and have the Home icon active
  const isHomeActive = pathname === '/dashboard' || pathname === '/';

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t border-border/50">
      <div className={`grid h-full max-w-lg grid-cols-5 mx-auto font-medium`}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative inline-flex flex-col items-center justify-center px-1 hover:bg-accent/50 group transition-colors h-full",
              "text-xs",
               (item.href === '/dashboard' && isHomeActive) || (item.href !== '/dashboard' && (pathname === item.href || (item.href === "/profile" && pathname.startsWith("/messages"))))
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {item.label === 'Profile' && hasUnread && (
              <span className="absolute top-2.5 right-4 w-2 h-2 rounded-full bg-primary" />
            )}
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs text-center">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
