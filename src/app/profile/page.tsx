
'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, User as UserIcon, Activity, MessageSquare } from "lucide-react";
import { useAuth, signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useUserData } from "@/hooks/use-user-data";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Message } from "@/lib/types";


export default function ProfilePage() {
  const { user } = useAuth();
  const { userData, loading } = useUserData();
  const router = useRouter();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "messages"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unreadCount = snapshot.docs
        .map(doc => doc.data() as Message)
        .filter(msg => !msg.isRead && msg.senderId !== user.uid)
        .length;
      setUnreadMessages(unreadCount);
    });
    return () => unsubscribe();
  }, [user]);


  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
       <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Profile</h1>
       </div>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="size-5 text-primary" />
            <span>{user?.displayName || "User"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
            {loading ? (
              <>
                <Skeleton className="h-[76px] w-full" />
                <Skeleton className="h-[76px] w-full" />
              </>
            ) : (
               <>
                <div className="flex flex-col items-center justify-center p-3 bg-card-foreground/5 rounded-lg">
                    <p className="text-xs text-muted-foreground">HC Balance</p>
                    <p className="text-lg font-bold">{(userData?.wallet_balance || 0).toLocaleString()} <span className="text-sm font-normal">HC</span></p>
                </div>
                 <div className="flex flex-col items-center justify-center p-3 bg-card-foreground/5 rounded-lg">
                    <p className="text-xs text-muted-foreground">USD Balance</p>
                    <p className="text-lg font-bold">${(userData?.usd_balance || 0).toFixed(2)}</p>
                </div>
               </>
            )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Menu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-2 h-11" asChild>
                <Link href="/messages">
                    <MessageSquare />
                    Messages
                    {unreadMessages > 0 && <Badge className="ml-auto">{unreadMessages}</Badge>}
                </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 h-11">
                <UserIcon />
                Account
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 h-11">
                <Shield />
                Security
            </Button>
             <Button variant="ghost" className="w-full justify-start gap-2 h-11">
                <Activity />
                Activity Log
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 h-11 text-destructive hover:text-destructive" onClick={handleLogout}>
              <LogOut />
              Logout
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
