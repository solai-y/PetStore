'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function AuthGuard({ children, requiredRole }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      router.push('/dashboard');
    }
  }, [user, isLoading, requiredRole, router]);

  if (isLoading) return <LoadingSkeleton />;
  if (!user) return null;
  if (requiredRole && user.role !== requiredRole) return null;
  return children;
}
