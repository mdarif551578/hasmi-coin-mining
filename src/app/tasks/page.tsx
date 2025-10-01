
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
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
import { CheckSquare, Plus, Loader2, Check } from "lucide-react";
import { useUserData } from "@/hooks/use-user-data";
import { useTasks } from "@/hooks/use-tasks";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function TasksPage() {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const router = useRouter();
  const { userData, loading: userLoading } = useUserData();
  const { tasks, completedTaskIds, completeTask, loading: tasksLoading } = useTasks();

  const handleCreateTaskClick = () => {
    // This logic seems to check a pro status that is not on the user data hook,
    // assuming 'pro' or higher plans enable this.
    const userPlan = userData?.mining_plan || 'Free';
    if (userPlan !== 'Free') {
      // Assuming a valid link should be opened.
      // The FB link seems unrelated, replace with a relevant one if needed.
       window.open("https://www.facebook.com/profile.php?id=61581206455781", "_blank");
    } else {
      setShowUpgradeDialog(true);
    }
  };

  const handleUpgrade = () => {
    setShowUpgradeDialog(false);
    router.push("/mining");
  };

  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);

  const handleGoClick = async (taskId: string, link: string) => {
    setSubmittingTaskId(taskId);
    try {
        window.open(link, '_blank');
        await completeTask(taskId);
    } catch(e) {
        // Error is handled by toast in the hook
    } finally {
        setSubmittingTaskId(null);
    }
  }
  
  const isLoading = userLoading || tasksLoading;

  return (
    <>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
          <h1 className="text-xl font-bold">Tasks & Earn</h1>
          <Button size="sm" onClick={handleCreateTaskClick} disabled={isLoading}>
            <Plus className="mr-2" />
            Create Task
          </Button>
        </div>
        
        <div className="space-y-3">
          {isLoading ? (
            Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-[78px] w-full" />)
          ) : tasks.map((task) => {
            const isCompleted = completedTaskIds.includes(task.id);
            const isSubmitting = submittingTaskId === task.id;

            return (
                <Card
                key={task.id}
                className="flex items-center justify-between p-3 rounded-xl"
                >
                <div className="flex items-center gap-3">
                    <CheckSquare className="size-5 text-primary shrink-0" />
                    <div>
                    <p className="text-sm">{task.title}</p>
                    <p className="text-sm text-primary font-bold">
                        +{task.reward} HC
                    </p>
                    </div>
                </div>
                <Button 
                    size="sm" 
                    className="h-8 px-3 text-xs ml-2 w-20"
                    onClick={() => handleGoClick(task.id, task.link)}
                    disabled={isCompleted || isSubmitting}
                >
                   {isSubmitting ? <Loader2 className="animate-spin"/> : isCompleted ? <Check/> : 'Go'}
                </Button>
                </Card>
            );
          })}
           {!isLoading && tasks.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No tasks available at the moment.</p>
                </div>
           )}
        </div>
      </div>

      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrade Your Plan</AlertDialogTitle>
            <AlertDialogDescription>
              To create your own tasks, you need to upgrade from the Free plan. 
              Unlock this feature and more by upgrading your account in the Mining Center.
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
