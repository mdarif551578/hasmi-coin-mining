import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { user } from "@/lib/data";
import { LogOut, Shield } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <Card className="rounded-2xl text-center">
        <CardContent className="pt-6">
          <Avatar className="mx-auto size-24 border-4 border-primary">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h1 className="mt-4 text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.referralCode}</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
                <Shield className="mr-2" />
                Security
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
