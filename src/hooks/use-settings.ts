
'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useSettings() {
  const [settings, setSettings] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsDocRef = doc(db, 'settings', 'exchangeRates');
    
    const unsubscribe = onSnapshot(settingsDocRef, (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      } else {
        console.warn("Settings document 'exchangeRates' not found in Firestore.");
        setSettings(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching settings:", error);
      setSettings(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { settings, loading };
}
