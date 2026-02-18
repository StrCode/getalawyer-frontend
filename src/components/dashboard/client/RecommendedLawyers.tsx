import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data - replace with actual API calls
const recommendedLawyers = [
  {
    id: '1',
    name: 'Amélie Laurent',
    title: 'Founder & CEO',
    description: 'Former co-founder of Opendeor. Early staff at Spotify and Clearbit.',
    image: '/placeholder-lawyer.jpg',
  },
  {
    id: '2',
    name: 'Amélie Laurent',
    title: 'Founder & CEO',
    description: 'Former co-founder of Opendeor. Early staff at Spotify and Clearbit.',
    image: '/placeholder-lawyer.jpg',
  },
  {
    id: '3',
    name: 'Amélie Laurent',
    title: 'Founder & CEO',
    description: 'Former co-founder of Opendeor. Early staff at Spotify and Clearbit.',
    image: '/placeholder-lawyer.jpg',
  },
];

export function RecommendedLawyers() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recommended Lawyers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {recommendedLawyers.map((lawyer) => (
            <div key={lawyer.id} className="space-y-3">
              <div className="bg-muted rounded-lg w-full h-48" />
              <div>
                <h3 className="font-semibold">{lawyer.name}</h3>
                <p className="text-muted-foreground text-sm">{lawyer.title}</p>
                <p className="mt-2 text-muted-foreground text-xs">{lawyer.description}</p>
                <Button variant="link" className="p-0 h-auto text-xs">
                  View profile
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
