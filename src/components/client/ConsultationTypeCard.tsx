import { Link } from '@tanstack/react-router';
import { Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConsultationType } from '@/types/booking';

interface ConsultationTypeCardProps {
  consultationType: ConsultationType;
  lawyerId: string;
}

export function ConsultationTypeCard({ consultationType, lawyerId }: ConsultationTypeCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid="consultation-type-card">
      <CardHeader>
        <CardTitle>{consultationType.name}</CardTitle>
        <CardDescription>{consultationType.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="gap-4 grid grid-cols-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>
              <span className="font-medium">{consultationType.duration}</span> minutes
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>
              <span className="font-medium">${consultationType.price.toFixed(2)}</span>
            </span>
          </div>
        </div>

        <Link
          to="/client/book/$lawyerId/$typeId"
          params={{ lawyerId, typeId: consultationType.id }}
        >
          <Button className="w-full">Book Consultation</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
