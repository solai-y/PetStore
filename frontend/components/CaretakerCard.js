import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Star } from 'lucide-react';

export default function CaretakerCard({ caretaker }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{caretaker.email || caretaker.id}</CardTitle>
          {caretaker.hourly_rate && (
            <span className="flex items-center gap-0.5 text-sm font-semibold text-emerald-600">
              <DollarSign className="w-3.5 h-3.5" />
              {caretaker.hourly_rate}/hr
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {caretaker.bio && (
          <p className="text-sm text-gray-600 line-clamp-3">{caretaker.bio}</p>
        )}
        {caretaker.accepted_pet_types?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {caretaker.accepted_pet_types.map((t) => (
              <Badge key={t} variant="secondary" className="capitalize text-xs">{t}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
