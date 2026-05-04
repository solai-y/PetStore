'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  species: z.string().min(1, 'Species is required'),
  breed: z.string().optional(),
  age: z.preprocess((v) => (v === '' ? undefined : Number(v)), z.number().int().positive().optional()),
  notes: z.string().optional(),
  photo_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

function PetDetailForm() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    api.pets.get(id)
      .then((pet) => reset(pet))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await api.pets.update(id, data);
      toast.success('Pet updated');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={1} />;

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit pet</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { id: 'name', label: 'Name *', type: 'text' },
              { id: 'species', label: 'Species *', type: 'text' },
              { id: 'breed', label: 'Breed', type: 'text' },
              { id: 'age', label: 'Age (years)', type: 'number' },
              { id: 'photo_url', label: 'Photo URL', type: 'url' },
            ].map(({ id: fid, label, type }) => (
              <div key={fid} className="space-y-1">
                <Label htmlFor={fid}>{label}</Label>
                <Input id={fid} type={type} {...register(fid)} />
                {errors[fid] && <p className="text-sm text-red-500">{errors[fid].message}</p>}
              </div>
            ))}
            <div className="space-y-1">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register('notes')} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/pets')}>
                Back
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PetDetailPage() {
  return (
    <AuthGuard requiredRole="owner">
      <PetDetailForm />
    </AuthGuard>
  );
}
