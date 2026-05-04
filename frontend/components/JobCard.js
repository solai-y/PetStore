import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign } from 'lucide-react';

const statusColors = {
  open: 'bg-green-100 text-green-800',
  confirmed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

export default function JobCard({ booking }) {
  const petName = booking.pets?.name || 'Unknown pet';
  const applicantCount = booking.applications?.length ?? booking.applicant_count ?? null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{petName}</CardTitle>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[booking.status] || statusColors.open}`}>
            {booking.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-gray-600 line-clamp-2">{booking.description}</p>
        <div className="flex gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {booking.start_date} → {booking.end_date}
          </span>
          {booking.budget && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              {booking.budget}
            </span>
          )}
        </div>
        {applicantCount !== null && (
          <p className="text-xs text-gray-400">{applicantCount} applicant{applicantCount !== 1 ? 's' : ''}</p>
        )}
        <Link href={`/jobs/${booking.id}`}>
          <Button variant="outline" size="sm" className="w-full mt-2">View details</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
