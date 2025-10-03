
'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import type { TaskSubmission } from '@/lib/types';
import { useToast } from './use-toast';

export function useTaskSubmissions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      setSubmissions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const submissionsQuery = query(collection(db, 'task_submissions'), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(submissionsQuery, (snapshot) => {
      const fetchedSubmissions: TaskSubmission[] = [];
      snapshot.forEach((doc) => {
        fetchedSubmissions.push({ id: doc.id, ...doc.data() } as TaskSubmission);
      });
      setSubmissions(fetchedSubmissions);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching task submissions:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch your task submissions.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const createSubmission = async (taskId: string, screenshotUrls: string[], submissionText: string) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'task_submissions'), {
        userId: user.uid,
        taskId,
        screenshotUrls,
        submissionText,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Submission Successful', description: 'Your task proof has been submitted for approval.' });
    } catch (error) {
      console.error('Error creating submission:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not create your submission.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSubmission = async (submissionId: string, screenshotUrls: string[], submissionText: string) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const submissionRef = doc(db, 'task_submissions', submissionId);
      await updateDoc(submissionRef, {
        screenshotUrls,
        submissionText,
      });
      toast({ title: 'Submission Updated', description: 'Your changes have been saved.' });
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update your submission.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSubmission = async (submissionId: string) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, 'task_submissions', submissionId));
      toast({ title: 'Submission Deleted', description: 'Your task submission has been removed.' });
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete your submission.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submissions, createSubmission, updateSubmission, deleteSubmission, loading, isSubmitting };
}
