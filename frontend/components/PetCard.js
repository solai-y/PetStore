import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PawPrint } from 'lucide-react';

export default function PetCard({ pet, onDelete }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-emerald-500" />
            {pet.name}
          </CardTitle>
          <Badge variant="secondary" className="capitalize">{pet.species}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {pet.breed && <p className="text-sm text-gray-500">{pet.breed}{pet.age ? ` · ${pet.age} yrs` : ''}</p>}
        {pet.notes && <p className="text-sm text-gray-600 line-clamp-2">{pet.notes}</p>}
        <div className="flex gap-2 pt-2">
          <Link href={`/pets/${pet.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">Edit</Button>
          </Link>
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(pet.id)}
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
