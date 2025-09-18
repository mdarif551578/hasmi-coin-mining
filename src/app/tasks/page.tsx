import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";
import { tasks } from "@/lib/data";

export default function TasksPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Tasks & Earn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tasks.map(task => (
            <Card key={task.id} className="flex items-center justify-between p-4 bg-card/50">
              <div className="flex items-center gap-4">
                <CheckSquare className="size-6 text-primary" />
                <div>
                  <p>{task.description}</p>
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