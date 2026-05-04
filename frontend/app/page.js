import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PawPrint, Heart, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-16 space-y-6">
        <div className="flex justify-center">
          <div className="bg-emerald-100 p-4 rounded-full">
            <PawPrint className="w-12 h-12 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Trusted care for your pets
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          CarePets connects pet owners with verified caretakers. Post a job,
          receive applications, and choose the perfect match for your furry
          family member.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/signup?role=owner">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              I&apos;m a pet owner
            </Button>
          </Link>
          <Link href="/signup?role=caretaker">
            <Button size="lg" variant="outline">
              I&apos;m a caretaker
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: <PawPrint className="w-6 h-6 text-emerald-500" />,
            title: 'Post a job',
            desc: 'Describe what your pet needs and when. Caretakers will apply.',
          },
          {
            icon: <Heart className="w-6 h-6 text-rose-400" />,
            title: 'Choose the right match',
            desc: 'Review applications and confirm the caretaker you trust most.',
          },
          {
            icon: <Shield className="w-6 h-6 text-blue-400" />,
            title: 'Stay in the loop',
            desc: 'Confirmed and rejected applicants are notified automatically.',
          },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl border p-6 space-y-3">
            {icon}
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Browse available caretakers</h2>
        <p className="text-gray-500">No account needed to explore profiles.</p>
        <Link href="/caretakers">
          <Button variant="outline" size="lg">See all caretakers</Button>
        </Link>
      </section>
    </div>
  );
}
