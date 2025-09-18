import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { user } from "@/lib/data";
import { LogOut, Shield, User as UserIcon, Cog, Activity } from "lucide-react";
import { ReferralCard } from "@/components/dashboard/ReferralCard";
import { MiningStatusCard } from "@/components/dashboard/MiningStatusCard";

export default function ProfilePage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="size-6 text-primary" />
            <span>{user.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-4 bg-card/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
                <p className="text-2xl font-bold">{user.walletBalance.toLocaleString()} HC</p>
            </div>
             <div className="flex flex-col items-center justify-center p-4 bg-card/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Referrals</p>
                <p className="text-2xl font-bold">{user.totalReferrals}</p>
            </div>
        </CardContent>
      </Card>
      
      <ReferralCard />
      <MiningStatusCard />

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
                <UserIcon className="mr-2" />
                Account
            </Button>
            <Button variant="ghost" className="w-full justify-start">
                <Shield className="mr-2" />
                Security
            </Button>
             <Button variant="ghost" className="w-full justify-start">
                <Activity className="mr-2" />
                Activity Log
            </Button>
            <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
                <LogOut className="mr-2" />
                Logout
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
