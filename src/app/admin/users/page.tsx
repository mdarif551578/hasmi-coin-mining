
'use client';
import React from 'react';
import { collection, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useAdminPagination } from '@/hooks/admin/use-admin-pagination';
import { Button } from '@/components/ui/button';

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

export default function AdminUsersPage() {
  const { data: users, loading, nextPage, prevPage, currentPage, canNext, canPrev } = useAdminPagination('users', [orderBy('createdAt', 'desc')]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>HC Balance</TableHead>
                <TableHead>USD Balance</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && users.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  </TableRow>
                ))
              ) : users.map(user => (
                <TableRow key={user.id}>
                  <TableCell data-label="Name" className="font-medium">{user.displayName}</TableCell>
                  <TableCell data-label="Email">{user.email}</TableCell>
                  <TableCell data-label="HC Balance">{(user.wallet_balance || 0).toLocaleString()}</TableCell>
                  <TableCell data-label="USD Balance">${(user.usd_balance || 0).toFixed(2)}</TableCell>
                  <TableCell data-label="Role">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{user.role}</Badge>
                  </TableCell>
                  <TableCell data-label="Joined">{user.createdAt ? format(user.createdAt.toDate(), 'PPp') : 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-end">
            <PaginationControls
                canPrev={canPrev}
                canNext={canNext}
                currentPage={currentPage}
                onPrev={prevPage}
                onNext={nextPage}
                loading={loading}
            />
        </CardFooter>
      </Card>
    </div>
  );
}
