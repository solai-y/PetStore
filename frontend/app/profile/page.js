'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PET_TYPES = ['dog', 'cat', 'bird', 'rabbit', 'fish', 'reptile'];

const schema = z.object({
  bio: z.string().optional(),
  hourly_rate: z.preprocess(
    (v) => (v === '' ? undefined : Number(v)),
    z.number().positive().optional()
  ),
});

function ProfileContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [acceptedTypes, setAcceptedTypes] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!user?.id) return;
    api.users.get(user.id)
      .then((profile) => {
        reset(profile);
        setAcceptedTypes(profile.accepted_pet_types || []);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [user?.id, reset]);

  const togglePetType = (type) => {
    setAcceptedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data };
      if (user?.role === 'caretaker') {
        payload.accepted_pet_types = acceptedTypes;
      }
      await api.users.update(user.id, payload);
      toast.success('Profile updated');
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
          <CardTitle>Edit profile</CardTitle>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {user?.role === 'caretaker' && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Tell owners about yourself…" {...register('bio')} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="hourly_rate">Hourly rate ($)</Label>
                  <Input id="hourly_rate" type="number" step="0.01" {...register('hourly_rate')} />
                  {errors.hourly_rate && <p className="text-sm text-red-500">{errors.hourly_rate.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Accepted pet types</Label>
                  <div className="flex flex-wrap gap-2">
                    {PET_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => togglePetType(t)}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors capitalize ${
                          acceptedTypes.includes(t)
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'border-gray-300 text-gray-600 hover:border-emerald-400'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {user?.role === 'owner' && (
              <p className="text-sm text-gray-500">
                Role: <Badge variant="secondary">Pet Owner</Badge>
              </p>
            )}

            <Button type="submit" disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Saving…' : 'Save profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
