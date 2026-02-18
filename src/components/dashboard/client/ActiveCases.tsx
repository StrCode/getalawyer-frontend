import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const activeCases = [
  {
    id: '1',
    title: 'To go over documents',
    date: 'Apr 17',
    priority: 'HIGH PRIORITY',
    status: 'Confirmed',
    client: 'Amélie Laurent',
    category: 'Estate Planning',
  },
  {
    id: '2',
    title: 'To go over documents',
    date: 'Apr 17',
    priority: 'HIGH PRIORITY',
    status: 'Confirmed',
    client: 'Amélie Laurent',
    category: 'Estate Planning',
  },
  {
    id: '3',
    title: 'To go over documents',
    date: 'Apr 17',
    priority: 'HIGH PRIORITY',
    status: 'Confirmed',
    client: 'Amélie Laurent',
    category: 'Estate Planning',
  },
];

export function ActiveCases() {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-lg">Active Cases</CardTitle>
        <Button variant="link" className="p-0 h-auto text-sm">
          See All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeCases.map((case_) => (
          <div key={case_.id} className="space-y-2 pb-4 last:border-0 border-b">
            <div className="flex items-start gap-2">
              <span className="text-destructive text-xs">↑ {case_.priority}</span>
            </div>
            <h4 className="font-medium">{case_.title}</h4>
            <p className="text-muted-foreground text-sm">{case_.date}</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6" />
                <span className="text-sm">{case_.client}</span>
              </div>
              <Badge variant="secondary">{case_.category}</Badge>
            </div>
            <Badge className="bg-green-100 text-green-800">{case_.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
