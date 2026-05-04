'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import PetCard from '@/components/PetCard';
import JobCard from '@/components/JobCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

function OwnerDashboard({ user }) {
  const [pets, setPets] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.pets.list(), api.bookings.list()])
      .then(([p, b]) => { setPets(p); setBookings(b); })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDeletePet = async (id) => {
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <Link href="/jobs/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-1" /> Post a job
          </Button>
        </Link>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My pets</h2>
          <Link href="/pets/new">
            <Button variant="outline" size="sm"><Plus className="w-3.5 h-3.5 mr-1" /> Add pet</Button>
          </Link>
        </div>
        {pets?.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border rounded-lg bg-white">
            <p>No pets yet.</p>
            <Link href="/pets/new"><Button variant="link" className="text-emerald-600">Add your first pet</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pets?.map((p) => <PetCard key={p.id} pet={p} onDelete={handleDeletePet} />)}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">My job posts</h2>
        {bookings?.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border rounded-lg bg-white">
            <p>No job posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bookings?.map((b) => <JobCard key={b.id} booking={b} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function CaretakerDashboard() {
  const [openJobs, setOpenJobs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.bookings.list({ status: 'open' })
      .then(setOpenJobs)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Open jobs</h1>
      {openJobs?.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border rounded-lg bg-white">
          No open jobs right now. Check back later!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {openJobs?.map((b) => <JobCard key={b.id} booking={b} />)}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      {user?.role === 'owner' ? <OwnerDashboard user={user} /> : <CaretakerDashboard />}
    </AuthGuard>
  );
}
