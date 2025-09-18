import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";

const tasks = [
  { id: 1, description: "Follow us on Twitter", reward: 5 },
  { id: 2, description: "Join our Telegram channel", reward: 5 },
  { id: 3, description: "Watch a tutorial video", reward: 2 },
];

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
