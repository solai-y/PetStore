'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import CaretakerCard from '@/components/CaretakerCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const PET_TYPES = ['all', 'dog', 'cat', 'bird', 'rabbit', 'fish', 'reptile'];

export default function CaretakersPage() {
  const [caretakers, setCaretakers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.users.caretakers()
      .then(setCaretakers)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = caretakers?.filter((c) => {
    const matchType =
      filter === 'all' || c.accepted_pet_types?.includes(filter);
    const matchSearch =
      !search ||
      c.bio?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Browse caretakers</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or bio…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {PET_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors capitalize ${
                filter === t
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'border-gray-300 text-gray-600 hover:border-emerald-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : filtered?.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border rounded-lg bg-white">
          No caretakers match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered?.map((c) => <CaretakerCard key={c.id} caretaker={c} />)}
        </div>
      )}
    </div>
  );
}
