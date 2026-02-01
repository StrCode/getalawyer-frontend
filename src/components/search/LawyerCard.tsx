import { Award, Briefcase, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { LawyerSearchResult } from '@/types/lawyer-search';

interface LawyerCardProps {
  lawyer: LawyerSearchResult;
  onViewProfile: (lawyerId: string) => void;
}

export function LawyerCard({ lawyer, onViewProfile }: LawyerCardProps) {
  const initials = lawyer.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={lawyer.profileImage} alt={lawyer.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{lawyer.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{lawyer.state}, {lawyer.country}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span>{lawyer.yearsOfExperience} years experience</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {lawyer.bio && (
          <p className="text-muted-foreground text-sm line-clamp-2">{lawyer.bio}</p>
        )}
        
        {lawyer.specializations.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Award className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-medium text-muted-foreground text-xs">Specializations</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lawyer.specializations.slice(0, 3).map((spec) => (
                <Badge key={spec.id} variant="secondary" className="text-xs">
                  {spec.name}
                </Badge>
              ))}
              {lawyer.specializations.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{lawyer.specializations.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button 
            onClick={() => onViewProfile(lawyer.id)} 
            className="w-full"
            variant="default"
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
