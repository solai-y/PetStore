'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PET_TYPES = ['dog', 'cat', 'bird', 'rabbit', 'fish', 'reptile'];

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['owner', 'caretaker']),
  bio: z.string().optional(),
  hourly_rate: z.preprocess((v) => (v === '' ? undefined : Number(v)), z.number().positive().optional()),
  accepted_pet_types: z.array(z.string()).optional(),
});

function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'owner';
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole, accepted_pet_types: [] },
  });

  const role = watch('role');
  const acceptedTypes = watch('accepted_pet_types') || [];

  const togglePetType = (type) => {
    const updated = acceptedTypes.includes(type)
      ? acceptedTypes.filter((t) => t !== type)
      : [...acceptedTypes, type];
    setValue('accepted_pet_types', updated);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { name: data.name, email: data.email, password: data.password, role: data.role };
      if (data.role === 'caretaker') {
        if (data.bio) payload.bio = data.bio;
        if (data.hourly_rate) payload.hourly_rate = data.hourly_rate;
        if (data.accepted_pet_types?.length) payload.accepted_pet_types = data.accepted_pet_types;
      }
      await signup(payload);
      toast.success('Account created! Welcome to CarePets.');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto pt-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" type="text" placeholder="Jane Smith" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>I am a…</Label>
              <div className="flex gap-4">
                {['owner', 'caretaker'].map((r) => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={r}
                      {...register('role')}
                      className="accent-emerald-600"
                    />
                    <span className="capitalize text-sm">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {role === 'caretaker' && (
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
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>

            <p className="text-sm text-center text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-600 hover:underline">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
