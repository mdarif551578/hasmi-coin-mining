
'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, DocumentData, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminActions } from '@/hooks/admin/use-admin-actions';
import { Check, X, Plus, ExternalLink } from 'lucide-react';
import type { AppTask, TaskSubmission } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

const API_BASE_URL = "https://hasmi-img-storage.vercel.app";

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  reward: z.coerce.number().min(0, 'Reward must be non-negative'),
  link: z.string().url('Must be a valid URL'),
  isActive: z.boolean(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<AppTask[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const { loading: actionLoading, handleTaskSubmission } = useAdminActions();
  const { toast } = useToast();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { isActive: true },
  });

  useEffect(() => {
    const tasksQuery = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    // Fetch all submissions and filter client-side to avoid index requirement.
    const submissionsQuery = query(collection(db, 'task_submissions'), orderBy('createdAt', 'desc'));

    const unsubTasks = onSnapshot(tasksQuery, async (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppTask)));
      setLoading(false);
    });

    const unsubSubmissions = onSnapshot(submissionsQuery, async (snapshot) => {
        const subs: TaskSubmission[] = [];
        for (const docSnap of snapshot.docs) {
            const subData = docSnap.data();
            if (subData.status === 'pending') {
                const sub = { id: docSnap.id, ...subData } as TaskSubmission;
                const userDoc = await getDoc(doc(db, 'users', sub.userId));
                if(userDoc.exists()) {
                    sub.user = {
                        displayName: userDoc.data().displayName,
                        email: userDoc.data().email
                    }
                }
                subs.push(sub);
            }
        }
        setSubmissions(subs);
        setLoading(false);
    });

    return () => {
      unsubTasks();
      unsubSubmissions();
    };
  }, []);

  const onTaskSubmit: SubmitHandler<TaskFormValues> = async (data) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        ...data,
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Success', description: 'New task has been created.' });
      reset();
      setDialogOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create task.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Task Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Create Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>Add a new task for users to complete.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onTaskSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Textarea id="title" {...register('title')} />
                {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="reward">Reward (HC)</Label>
                <Input id="reward" type="number" {...register('reward')} />
                {errors.reward && <p className="text-red-500 text-sm">{errors.reward.message}</p>}
              </div>
              <div>
                <Label htmlFor="link">Link</Label>
                <Input id="link" {...register('link')} />
                {errors.link && <p className="text-red-500 text-sm">{errors.link.message}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="isActive" {...register('isActive')} className="h-4 w-4" defaultChecked/>
                <Label htmlFor="isActive">Is Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

       <Tabs defaultValue="submissions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="submissions">Pending Submissions</TabsTrigger>
              <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
            </TabsList>
            <TabsContent value="submissions">
                 <Card>
                    <CardHeader>
                        <CardTitle>Pending Submissions</CardTitle>
                        <CardDescription>Review and approve or reject user task submissions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Task ID</TableHead>
                            <TableHead>Submission</TableHead>
                            <TableHead>Screenshot</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loading && submissions.length === 0 ? (
                            <TableRow><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                        ) : submissions.length === 0 ? (
                            <TableRow className="md:table-row flex-col items-start"><TableCell colSpan={5} className="h-24 text-center block md:table-cell">No pending submissions.</TableCell></TableRow>
                        ) : submissions.map(sub => (
                            <TableRow key={sub.id}>
                            <TableCell data-label="User">
                                <div>{sub.user?.displayName}</div>
                                <div className="text-xs text-muted-foreground">{sub.user?.email}</div>
                            </TableCell>
                            <TableCell data-label="Task ID" className="font-mono text-xs">{sub.taskId}</TableCell>
                            <TableCell data-label="Submission Text" className="max-w-xs truncate">{sub.submissionText}</TableCell>
                            <TableCell data-label="Screenshot">
                                <a href={`${API_BASE_URL}${sub.screenshotUrl}`} target="_blank" rel="noopener noreferrer">
                                <Image src={`${API_BASE_URL}${sub.screenshotUrl}`} alt="Screenshot" width={80} height={45} className="rounded-md object-cover" />
                                </a>
                            </TableCell>
                            <TableCell data-label="Actions" className="text-right">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500" onClick={() => handleTaskSubmission(sub.id, 'approved')} disabled={actionLoading}><Check /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleTaskSubmission(sub.id, 'rejected')} disabled={actionLoading}><X /></Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="all-tasks">
                <Card>
                    <CardHeader><CardTitle>All Tasks</CardTitle></CardHeader>
                    <CardContent>
                     <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Reward</TableHead>
                            <TableHead>Link</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loading && tasks.length === 0 ? (
                           <TableRow><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                        ) : tasks.map(task => (
                            <TableRow key={task.id}>
                            <TableCell data-label="Title">{task.title}</TableCell>
                            <TableCell data-label="Reward">{task.reward} HC</TableCell>
                            <TableCell data-label="Link"><a href={task.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">Link <ExternalLink className="h-3 w-3" /></a></TableCell>
                            <TableCell data-label="Status">{task.isActive ? 'Active' : 'Inactive'}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
             </TabsContent>
       </Tabs>
    </div>
  );
}
