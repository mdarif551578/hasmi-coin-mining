
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  limit,
  startAfter,
  endBefore,
  onSnapshot,
  DocumentData,
  QueryConstraint,
  limitToLast,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ITEMS_PER_PAGE = 10;

export function useAdminPagination(collectionName: string, initialConstraints: QueryConstraint[] = []) {
  const [data, setData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSwitchingPage, setIsSwitchingPage] = useState(false);
  const [firstDoc, setFirstDoc] = useState<DocumentData | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [docCount, setDocCount] = useState(0);

  const getQuery = (constraints: QueryConstraint[] = []) => {
    return query(collection(db, collectionName), ...initialConstraints, ...constraints);
  };

  useEffect(() => {
    setLoading(true);
    const q = getQuery([limit(ITEMS_PER_PAGE)]);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setFirstDoc(snapshot.docs[0]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setDocCount(snapshot.size);
      } else {
        setData([]);
        setFirstDoc(null);
        setLastDoc(null);
        setDocCount(0);
      }
      setLoading(false);
      setIsSwitchingPage(false);
    }, (error) => {
      console.error(`Error fetching ${collectionName}:`, error);
      setLoading(false);
      setIsSwitchingPage(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, JSON.stringify(initialConstraints)]);

  const nextPage = useCallback(() => {
    if (!lastDoc) return;
    setIsSwitchingPage(true);
    const nextQuery = getQuery([startAfter(lastDoc), limit(ITEMS_PER_PAGE)]);
    const unsubscribe = onSnapshot(nextQuery, (snapshot) => {
      if (!snapshot.empty) {
        setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setFirstDoc(snapshot.docs[0]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setCurrentPage(prev => prev + 1);
        setDocCount(snapshot.size);
      } else {
        setDocCount(0);
      }
      setIsSwitchingPage(false);
      unsubscribe();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastDoc, collectionName, JSON.stringify(initialConstraints)]);

  const prevPage = useCallback(() => {
    if (!firstDoc) return;
    setIsSwitchingPage(true);
    const prevQuery = getQuery([endBefore(firstDoc), limitToLast(ITEMS_PER_PAGE)]);
    const unsubscribe = onSnapshot(prevQuery, (snapshot) => {
      if (!snapshot.empty) {
        setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setFirstDoc(snapshot.docs[0]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setCurrentPage(prev => Math.max(1, prev - 1));
        setDocCount(snapshot.size);
      } else {
         setDocCount(0);
      }
      setIsSwitchingPage(false);
      unsubscribe();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstDoc, collectionName, JSON.stringify(initialConstraints)]);
  
  const canNext = docCount === ITEMS_PER_PAGE;
  const canPrev = currentPage > 1;

  return { 
    data, 
    loading: loading || isSwitchingPage, 
    nextPage, 
    prevPage, 
    currentPage, 
    canNext, 
    canPrev
  };
}
