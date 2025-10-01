
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import type { AppTask } from '@/lib/types';
import { useToast } from './use-toast';

export function useTasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<AppTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setTasks([]);
        setLoading(false);
        return;
    }

    setLoading(true);
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

    return () => {
      unsubscribeTasks();
    };
  }, [user, toast]);

  return { tasks, loading };
}
