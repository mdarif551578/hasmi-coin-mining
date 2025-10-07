
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminActions } from '@/hooks/admin/use-admin-actions';
import { Check, X, Plus, ExternalLink, Loader2, Image as ImageIcon } from 'lucide-react';
import type { AppTask } from '@/lib/types';
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
import { useAdminPagination } from '@/hooks/admin/use-admin-pagination';
import axios from 'axios';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const API_BASE_URL = "https://hasmi-img-storage.vercel.app";

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  reward: z.coerce.number().min(0, 'Reward must be non-negative'),
  link: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  isActive: z.boolean(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

const PaginationControls = ({ canPrev, canNext, currentPage, onPrev, onNext, loading }: { canPrev: boolean, canNext: boolean, currentPage: number, onPrev: () => void, onNext: () => void, loading: boolean }) => (
    <div className="flex items-center justify-end space-x-2 py-4">
        <span className="text-sm text-muted-foreground">Page {currentPage}</span>
        <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
            disabled={!canPrev || loading}
        >
            Previous
        </Button>
        <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={!canNext || loading}
        >
            Next
        </Button>
    </div>
);

export default function AdminTasksPage() {
  const { toast } = useToast();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const tasksQueryConstraints = useMemo(() => [orderBy('createdAt', 'desc')], []);
  const submissionsQueryConstraints = useMemo(() => [orderBy('createdAt', 'desc')], []);

  const { data: tasks, loading: tasksLoading, nextPage: nextTasks, prevPage: prevTasks, currentPage: tasksCurrentPage, canNext: canNextTasks, canPrev: canPrevTasks } = useAdminPagination('tasks', tasksQueryConstraints);
  const { data: allSubmissions, loading: submissionsLoading, nextPage: nextSubs, prevPage: prevSubs, currentPage: subsCurrentPage, canNext: canNextSubs, canPrev: canPrevSubs } = useAdminPagination('task_submissions', submissionsQueryConstraints);

  const submissions = allSubmissions.filter(sub => sub.status === 'pending');

  const { loading: actionLoading, handleTaskSubmission } = useAdminActions();
  
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { isActive: true },
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const filesArray = Array.from(e.target.files);
          setImageFiles(prev => [...prev, ...filesArray]);

          const newPreviews = filesArray.map(file => URL.createObjectURL(file));
          setImagePreviews(prev => [...prev, ...newPreviews]);
      }
      e.target.value = ''; // Reset input to allow selecting same file again
  };

  const removeImage = (index: number) => {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => {
          const newPreviews = prev.filter((_, i) => i !== index);
          // Revoke the object URL to free up memory
          URL.revokeObjectURL(prev[index]);
          return newPreviews;
      });
  };
  
  const onTaskSubmit: SubmitHandler<TaskFormValues> = async (data) => {
    let imageUrls: string[] = [];

    if (imageFiles.length > 0) {
        setIsUploading(true);
        for (const file of imageFiles) {
            const formData = new FormData();
            formData.append("file", file);
            try {
                const res = await axios.post(`${API_BASE_URL}/upload/`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                imageUrls.push(res.data.file_id);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Upload Failed', description: `Could not upload image ${file.name}.` });
                setIsUploading(false);
                return;
            }
        }
        setIsUploading(false);
    }

    try {
      await addDoc(collection(db, 'tasks'), {
        title: data.title,
        description: data.description,
        reward: data.reward,
        link: data.link || '',
        isActive: data.isActive,
        imageUrls: imageUrls,
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Success', description: 'New task has been created.' });
      reset();
      setImageFiles([]);
      setImagePreviews([]);
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
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>Add a new task for users to complete.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onTaskSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register('title')} />
                {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="description">Description (Markdown Supported)</Label>
                <Textarea id="description" {...register('description')} placeholder="**Bold**, *italic*, new lines, etc."/>
                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
              </div>
               <div>
                <Label htmlFor="images">Task Images (Optional)</Label>
                <Input id="images" type="file" accept="image/*" onChange={handleFileChange} multiple />
                 {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative aspect-square">
                                <Image src={preview} alt={`Preview ${index}`} fill={true} className="rounded-md object-cover"/>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                    onClick={() => removeImage(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reward">Reward (HC)</Label>
                    <Input id="reward" type="number" {...register('reward')} />
                    {errors.reward && <p className="text-red-500 text-sm">{errors.reward.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="link">Link (Optional)</Label>
                    <Input id="link" {...register('link')} />
                    {errors.link && <p className="text-red-500 text-sm">{errors.link.message}</p>}
                  </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="isActive" {...register('isActive')} checked={watch('isActive')} onCheckedChange={(checked) => reset({ ...watch(), isActive: checked })}/>
                <Label htmlFor="isActive">Is Active</Label>
              </div>
              <DialogFooter className="sticky bottom-0 bg-background pt-4">
                <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                  {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isUploading ? 'Uploading...' : isSubmitting ? 'Creating...' : 'Create'}
                </Button>
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
                    <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Task ID</TableHead>
                            <TableHead>Submission</TableHead>
                            <TableHead>Screenshots</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {submissionsLoading && submissions.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="md:table-cell"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                        ) : submissions.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="h-24 text-center md:table-cell">No pending submissions.</TableCell></TableRow>
                        ) : submissions.map(sub => (
                            <TableRow key={sub.id}>
                            <TableCell data-label="User ID" className="font-mono text-xs">{sub.userId}</TableCell>
                            <TableCell data-label="Task ID" className="font-mono text-xs">{sub.taskId}</TableCell>
                            <TableCell data-label="Submission Text" className="max-w-xs truncate">{sub.submissionText}</TableCell>
                            <TableCell data-label="Screenshots">
                                {sub.screenshotUrls && sub.screenshotUrls.length > 0 ? (
                                    <div className="flex items-center gap-2">
                                        <a href={`${API_BASE_URL}/files/${sub.screenshotUrls[0]}`} target="_blank" rel="noopener noreferrer">
                                            <Image src={`${API_BASE_URL}/files/${sub.screenshotUrls[0]}`} alt="Screenshot" width={80} height={45} className="rounded-md object-cover" />
                                        </a>
                                        {sub.screenshotUrls.length > 1 && (
                                            <Badge variant="secondary">+{sub.screenshotUrls.length - 1}</Badge>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <ImageIcon className="size-4" />
                                        <span>No screenshots</span>
                                    </div>
                                )}
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
                     <CardFooter className="justify-end">
                        <PaginationControls
                            canPrev={canPrevSubs}
                            canNext={canNextSubs}
                            currentPage={subsCurrentPage}
                            onPrev={prevSubs}
                            onNext={nextSubs}
                            loading={submissionsLoading}
                        />
                    </CardFooter>
                </Card>
            </TabsContent>
             <TabsContent value="all-tasks">
                <Card>
                    <CardHeader><CardTitle>All Tasks</CardTitle></CardHeader>
                    <CardContent className="p-0">
                     <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Reward</TableHead>
                            <TableHead>Link</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {tasksLoading && tasks.length === 0 ? (
                           <TableRow><TableCell colSpan={5} className="md:table-cell"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                        ) : tasks.map(task => (
                            <TableRow key={task.id}>
                             <TableCell data-label="Image">
                                {task.imageUrls && task.imageUrls.length > 0 ? <Image src={`${API_BASE_URL}/files/${task.imageUrls[0]}`} alt="Task image" width={64} height={36} className="rounded-md object-cover" /> : 'No image'}
                             </TableCell>
                            <TableCell data-label="Title" className="max-w-xs truncate">{task.title}</TableCell>
                            <TableCell data-label="Reward">{task.reward} HC</TableCell>
                            <TableCell data-label="Link">{task.link ? <a href={task.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">Link <ExternalLink className="h-3 w-3" /></a> : 'N/A'}</TableCell>
                            <TableCell data-label="Status">{task.isActive ? 'Active' : 'Inactive'}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </CardContent>
                     <CardFooter className="justify-end">
                        <PaginationControls
                            canPrev={canPrevTasks}
                            canNext={canNextTasks}
                            currentPage={tasksCurrentPage}
                            onPrev={prevTasks}
                            onNext={nextTasks}
                            loading={tasksLoading}
                        />
                    </CardFooter>
                </Card>
             </TabsContent>
       </Tabs>
    </div>
  );
}
