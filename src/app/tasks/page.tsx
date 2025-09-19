"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckSquare, Plus } from "lucide-react";
import { tasks, user } from "@/lib/data";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TasksPage() {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const router = useRouter();

  const handleCreateTaskClick = () => {
    if (user.isPro) {
      window.open("https://www.facebook.com/profile.php?id=61581206455781", "_blank");
    } else {
      setShowUpgradeDialog(true);
    }
  };

  const handleUpgrade = () => {
    setShowUpgradeDialog(false);
    router.push("/mining");
  };

  return (
    <>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
          <h1 className="text-xl font-bold">Tasks & Earn</h1>
          <Button size="sm" onClick={handleCreateTaskClick}>
            <Plus className="mr-2" />
            Create Task
          </Button>
        </div>
        
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className="flex items-center justify-between p-3 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="size-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm">{task.description}</p>
                  <p className="text-sm text-primary font-bold">
                    +{task.reward} HC
                  </p>
                </div>
              </div>
              <Button size="sm" className="h-8 px-3 text-xs ml-2">
                Go
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrade to Pro</AlertDialogTitle>
            <AlertDialogDescription>
              To create your own tasks, you need to upgrade to a Pro or Paid
              plan. Unlock this feature and more by upgrading your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpgrade}>Upgrade</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
