'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import PetCard from '@/components/PetCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

function PetsContent() {
  const [pets, setPets] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.pets.list()
      .then(setPets)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.pets.delete(id);
      setPets((prev) => prev.filter((p) => p.id !== id));
      toast.success('Pet removed');
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My pets</h1>
        <Link href="/pets/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-1" /> Add pet
          </Button>
        </Link>
      </div>

      {pets?.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border rounded-lg bg-white">
          <p className="mb-3">You haven&apos;t added any pets yet.</p>
          <Link href="/pets/new">
            <Button variant="outline">Add your first pet</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {pets?.map((p) => <PetCard key={p.id} pet={p} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}

export default function PetsPage() {
  return (
    <AuthGuard requiredRole="owner">
      <PetsContent />
    </AuthGuard>
  );
}
