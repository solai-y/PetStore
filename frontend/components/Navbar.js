'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { PawPrint } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-emerald-600">
          <PawPrint className="w-5 h-5" />
          CarePets
        </Link>

        <div className="flex items-center gap-3">
          {isLoading ? null : user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              {user.role === 'owner' && (
                <Link href="/pets">
                  <Button variant="ghost" size="sm">My Pets</Button>
                </Link>
              )}
              <Link href="/caretakers">
                <Button variant="ghost" size="sm">Caretakers</Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm">{user.email}</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/caretakers">
                <Button variant="ghost" size="sm">Browse Caretakers</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
