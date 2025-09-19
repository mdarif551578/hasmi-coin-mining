import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { user } from "@/lib/data";
import { LogOut, Shield, User as UserIcon, Activity } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
       <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Profile</h1>
       </div>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="size-5 text-primary" />
            <span>{user.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-3 bg-card-foreground/5 rounded-lg">
                <p className="text-xs text-muted-foreground">HC Balance</p>
                <p className="text-lg font-bold">{user.walletBalance.toLocaleString()} <span className="text-sm font-normal">HC</span></p>
            </div>
             <div className="flex flex-col items-center justify-center p-3 bg-card-foreground/5 rounded-lg">
                <p className="text-xs text-muted-foreground">USD Balance</p>
                <p className="text-lg font-bold">${user.usdBalance.toFixed(2)}</p>
            </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
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
            <Button variant="ghost" className="w-full justify-start gap-2 h-11 text-destructive hover:text-destructive">
                <LogOut />
                Logout
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
