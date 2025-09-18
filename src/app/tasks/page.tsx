import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";
import { tasks } from "@/lib/data";

export default function TasksPage() {
  return (
    <div className="p-4">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Tasks & Earn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map(task => (
            <Card key={task.id} className="flex items-center justify-between p-3 bg-card-foreground/5">
              <div className="flex items-center gap-3">
                <CheckSquare className="size-5 text-primary" />
                <div>
                  <p className="text-sm">{task.description}</p>
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
