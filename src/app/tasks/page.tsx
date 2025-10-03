
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckSquare, Loader2, Edit, Trash2, BadgeHelp, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { useUserData } from "@/hooks/use-user-data";
import { useTasks } from "@/hooks/use-tasks";
import { useTaskSubmissions } from "@/hooks/use-task-submissions";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppTask, TaskSubmission } from "@/lib/types";
import { cn } from "@/lib/utils";
import axios from "axios";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const API_BASE_URL = "https://hasmi-img-storage.vercel.app";

const MarkdownRenderer = ({ text }: { text: string }) => {
    return (
        <div className="prose prose-sm dark:prose-invert text-muted-foreground whitespace-pre-wrap">
            {text.split('\\n').map((line, index) => <p key={index}>{line}</p>)}
        </div>
    );
};

export default function TasksPage() {
  const { toast } = useToast();
  const { loading: userLoading } = useUserData();
  const { tasks, loading: tasksLoading } = useTasks();
  const { submissions, createSubmission, updateSubmission, deleteSubmission, loading: submissionsLoading, isSubmitting } = useTaskSubmissions();

  const [isSubmitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AppTask | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);
  
  const [submissionText, setSubmissionText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const resetDialog = () => {
    setSubmissionText("");
    setFile(null);
    setFilePreview(null);
    setSelectedTask(null);
    setSelectedSubmission(null);
    setIsUploading(false);
  }

  const openSubmitDialog = (task: AppTask) => {
    resetDialog();
    setSelectedTask(task);
    setSubmitDialogOpen(true);
  }

  const openEditDialog = (submission: TaskSubmission) => {
      resetDialog();
      setSelectedSubmission(submission);
      setSelectedTask(tasks.find(t => t.id === submission.taskId) || null);
      setSubmissionText(submission.submissionText);
      if (submission.screenshotUrl) {
        setFilePreview(`${API_BASE_URL}${submission.screenshotUrl}`);
      }
      setSubmitDialogOpen(true);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
        setFilePreview(URL.createObjectURL(selectedFile));
    } else {
        setFilePreview(null);
    }
  }

  const handleDialogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    let finalScreenshotUrl = selectedSubmission?.screenshotUrl;

    if (file) { // New file was selected, upload it
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post(`${API_BASE_URL}/upload/`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            finalScreenshotUrl = res.data.url;
        } catch (error) {
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload your screenshot.' });
            setIsUploading(false);
            return;
        } finally {
            setIsUploading(false);
        }
    }

    if (!finalScreenshotUrl) {
        toast({ variant: 'destructive', title: 'Missing Screenshot', description: 'Please select an image to upload.' });
        return;
    }
    
    if (selectedSubmission) { // This is an update
        await updateSubmission(selectedSubmission.id, finalScreenshotUrl, submissionText);
    } else { // This is a new submission
        await createSubmission(selectedTask.id, finalScreenshotUrl, submissionText);
    }

    if (!isSubmitting) {
        setSubmitDialogOpen(false);
        resetDialog();
    }
  }
  
  const isLoading = userLoading || tasksLoading || submissionsLoading;
  
  const SubmissionStatusIndicator = ({ status }: { status: TaskSubmission['status'] }) => {
    const statusMap = {
        pending: { icon: BadgeHelp, text: "Pending", color: "text-amber-500" },
        approved: { icon: CheckCircle2, text: "Approved", color: "text-green-500" },
        rejected: { icon: XCircle, text: "Rejected", color: "text-red-500" },
    };
    const { icon: Icon, text, color } = statusMap[status];
    return <div className={cn("flex items-center gap-1.5 text-xs font-medium", color)}><Icon className="size-4" />{text}</div>
  }

  return (
    <>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
          <h1 className="text-xl font-bold">Tasks & Earn</h1>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
          ) : tasks.map((task) => {
            const submission = submissions.find(s => s.taskId === task.id);
            return (
                <Card key={task.id} className="rounded-2xl overflow-hidden">
                    {task.imageUrl && (
                        <div className="aspect-video relative">
                            <Image src={`${API_BASE_URL}${task.imageUrl}`} alt={task.title} layout="fill" className="object-cover"/>
                        </div>
                    )}
                    <CardContent className="p-4">
                        <h3 className="font-bold">{task.title}</h3>
                        {task.description && <MarkdownRenderer text={task.description} />}
                        
                         <a href={task.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 my-2">
                            <ExternalLink className="size-4"/>
                            Visit Task Link
                        </a>

                        <Separator className="my-4"/>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Reward</p>
                                <p className="text-primary font-bold">
                                    +{task.reward} HC
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                                {submission ? (
                                    <>
                                        <SubmissionStatusIndicator status={submission.status} />
                                        {submission.status === 'pending' && (
                                            <div className="flex items-center gap-1">
                                                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => openEditDialog(submission)}>
                                                    <Edit className="size-3 mr-1"/> Edit
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                                            <Trash2 className="size-3" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete your submission for this task. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteSubmission(submission.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Button 
                                        onClick={() => openSubmitDialog(task)}
                                    >
                                    <CheckSquare className="mr-2"/>
                                    Submit Proof
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
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

      <Dialog open={isSubmitDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetDialog(); setSubmitDialogOpen(isOpen); }}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{selectedSubmission ? 'Edit' : 'Submit'} Proof for: {selectedTask?.title}</DialogTitle>
                  <DialogDescription>
                      Provide a screenshot and any required text to prove you've completed the task.
                  </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleDialogSubmit} className="space-y-4 pt-2">
                 <div className="space-y-2">
                     <Label>Task Link</Label>
                      <Button variant="secondary" className="w-full" asChild>
                        <a href={selectedTask?.link} target="_blank" rel="noopener noreferrer">
                             <ExternalLink className="mr-2"/>
                             Visit Task Link
                        </a>
                      </Button>
                 </div>
                  <div className="space-y-2">
                      <Label htmlFor="screenshot">Screenshot</Label>
                      <Input id="screenshot" type="file" accept="image/*" onChange={handleFileChange} />
                      {filePreview && (
                        <div className="mt-2 rounded-md overflow-hidden border">
                            <Image src={filePreview} alt="Screenshot preview" width={500} height={300} className="aspect-video w-full object-cover" />
                        </div>
                      )}
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="submission-text">Submission Text (Optional)</Label>
                      <Textarea id="submission-text" placeholder="e.g. Your username, a link, or other proof." value={submissionText} onChange={e => setSubmissionText(e.target.value)} />
                  </div>
                  <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting || isUploading}>
                          {(isSubmitting || isUploading) && <Loader2 className="animate-spin mr-2"/>}
                          {isUploading ? "Uploading..." : isSubmitting ? "Submitting..." : "Submit for Approval"}
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </>
  );
}
