import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";
import { tasks } from "@/lib/data";

export default function TasksPage() {
  return (
    <div className="p-4 md:p-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Tasks & Earn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map(task => (
            <Card key={task.id} className="flex items-center justify-between p-3 md:p-4 bg-card-foreground/5">
              <div className="flex items-center gap-3 md:gap-4">
                <CheckSquare className="size-5 md:size-6 text-primary" />
                <div>
                  <p className="text-sm md:text-base">{task.description}</p>
                  <p className="text-sm text-primary font-bold">+{task.reward} HC</p>
                </div>
              </div>
              <Button size="sm">Go</Button>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
