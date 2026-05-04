'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
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

function NewPetForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.pets.create(data);
      toast.success('Pet added!');
      router.push('/pets');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add a pet</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { id: 'name', label: 'Name *', type: 'text' },
              { id: 'species', label: 'Species * (e.g. dog, cat)', type: 'text' },
              { id: 'breed', label: 'Breed', type: 'text' },
              { id: 'age', label: 'Age (years)', type: 'number' },
              { id: 'photo_url', label: 'Photo URL', type: 'url' },
            ].map(({ id, label, type }) => (
              <div key={id} className="space-y-1">
                <Label htmlFor={id}>{label}</Label>
                <Input id={id} type={type} {...register(id)} />
                {errors[id] && <p className="text-sm text-red-500">{errors[id].message}</p>}
              </div>
            ))}
            <div className="space-y-1">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Anything caretakers should know…" {...register('notes')} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                {loading ? 'Saving…' : 'Add pet'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewPetPage() {
  return (
    <AuthGuard requiredRole="owner">
      <NewPetForm />
    </AuthGuard>
  );
}
