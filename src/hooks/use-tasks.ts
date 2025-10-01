
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, onSnapshot, query, where, doc, runTransaction, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import type { AppTask } from '@/lib/types';
import { useToast } from './use-toast';

export function useTasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<AppTask[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch all active tasks
    const tasksQuery = query(collection(db, 'tasks'), where('isActive', '==', true));
    
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const fetchedTasks: AppTask[] = [];
      snapshot.forEach((doc) => {
        fetchedTasks.push({ id: doc.id, ...doc.data() } as AppTask);
      });
      setTasks(fetchedTasks);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch tasks.' });
      setLoading(false);
    });

    // Fetch user's completed tasks
    let unsubscribeCompleted: () => void = () => {};
    if (user) {
        const completedQuery = collection(db, 'users', user.uid, 'completed_tasks');
        unsubscribeCompleted = onSnapshot(completedQuery, (snapshot) => {
            const ids = snapshot.docs.map(doc => doc.id);
            setCompletedTaskIds(ids);
        }, (error) => {
            console.error("Error fetching completed tasks:", error);
        });
    }

    return () => {
      unsubscribeTasks();
      unsubscribeCompleted();
    };
  }, [user, toast]);

  const completeTask = useCallback(async (taskId: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not Authenticated' });
      return;
    }

    if (completedTaskIds.includes(taskId)) {
      toast({ variant: 'destructive', title: 'Task Already Completed' });
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        toast({ variant: 'destructive', title: 'Task not found' });
        return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const completedTaskRef = doc(db, 'users', user.uid, 'completed_tasks', taskId);

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                throw "User document does not exist!";
            }
            const newBalance = (userDoc.data().wallet_balance || 0) + task.reward;
            transaction.update(userDocRef, { wallet_balance: newBalance });
            transaction.set(completedTaskRef, { completedAt: new Date() });
        });
        
        toast({
            title: 'Task Completed!',
            description: `You have earned ${task.reward} HC.`,
        });

    } catch (error) {
        console.error('Error completing task:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not complete the task. Please try again.' });
        throw error;
    }
  }, [user, tasks, completedTaskIds, toast]);

  return { tasks, completedTaskIds, completeTask, loading };
}
