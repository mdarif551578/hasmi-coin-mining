import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus } from "lucide-react";
import { tasks } from "@/lib/data";
import Link from "next/link";

export default function TasksPage() {
  return (
    <div className="p-4 md:p-6">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tasks & Earn</CardTitle>
          <Link href="https://www.facebook.com/profile.php?id=61581206455781" target="_blank" passHref>
            <Button size="sm">
              <Plus className="mr-2" />
              Create Task
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map(task => (
            <Card key={task.id} className="flex items-center justify-between p-3 bg-card-foreground/5">
              <div className="flex items-center gap-3">
                <CheckSquare className="size-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm">{task.description}</p>
                  <p className="text-sm text-primary font-bold">+{task.reward} HC</p>
                </div>
              </div>
              <Button size="sm" className="h-8 px-3 text-xs ml-2">Go</Button>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
