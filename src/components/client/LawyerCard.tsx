import { Link } from '@tanstack/react-router';
import { Award, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { LawyerListItem } from '@/types/lawyer-profile';

interface LawyerCardProps {
  lawyer: LawyerListItem;
}

export function LawyerCard({ lawyer }: LawyerCardProps) {
  const initials = lawyer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid="lawyer-card">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate">{lawyer.name}</CardTitle>
            {lawyer.specialty && (
              <CardDescription className="flex items-center gap-2 mt-1">
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{lawyer.specialty}</span>
              </CardDescription>
            )}
            {lawyer.experience !== undefined && (
              <CardDescription className="flex items-center gap-2 mt-1">
                <Briefcase className="w-3.5 h-3.5 shrink-0" />
                <span>{lawyer.experience} years experience</span>
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {lawyer.consultationTypes && lawyer.consultationTypes.length > 0 && (
          <div>
            <p className="mb-2 font-medium text-sm">Consultation Types:</p>
            <div className="flex flex-wrap gap-1.5">
              {lawyer.consultationTypes.slice(0, 3).map((type) => (
                <Badge key={type.id} variant="secondary" className="text-xs">
                  {type.name}
                </Badge>
              ))}
              {lawyer.consultationTypes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{lawyer.consultationTypes.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="pt-2">
          <Link to="/client/lawyers/$id" params={{ id: lawyer.id }}>
            <Button className="w-full" variant="default">
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
