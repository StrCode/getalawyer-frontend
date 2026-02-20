import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useLawyers } from '@/lib/hooks/useLawyers';
import { LawyerCard } from './LawyerCard';

export function LawyerList() {
  const { data: lawyers, isLoading, error } = useLawyers();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter lawyers by specialty or consultation type
  const filteredLawyers = useMemo(() => {
    if (!lawyers || !searchQuery.trim()) {
      return lawyers || [];
    }

    const query = searchQuery.toLowerCase().trim();
    return lawyers.filter((lawyer) => {
      // Search by specialty
      if (lawyer.specialty?.toLowerCase().includes(query)) {
        return true;
      }

      // Search by consultation type name
      if (lawyer.consultationTypes?.some((type) => type.name.toLowerCase().includes(query))) {
        return true;
      }

      // Search by lawyer name
      if (lawyer.name.toLowerCase().includes(query)) {
        return true;
      }

      return false;
    });
  }, [lawyers, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-12" />
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="w-full h-64" />
          <Skeleton className="w-full h-64" />
          <Skeleton className="w-full h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load lawyers. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search/Filter Input */}
      <div className="relative">
        <Search className="top-3 left-3 absolute w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, specialty, or consultation type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="lawyer-search-input"
        />
      </div>

      {/* Empty State - No Lawyers */}
      {!lawyers || lawyers.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Lawyers Available</CardTitle>
            <CardDescription>
              There are no lawyers available at the moment. Please check back later.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {/* Empty State - No Search Results */}
      {lawyers && lawyers.length > 0 && filteredLawyers.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Results Found</CardTitle>
            <CardDescription>
              No lawyers match your search criteria. Try adjusting your search terms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-primary text-sm underline"
            >
              Clear search
            </button>
          </CardContent>
        </Card>
      ) : null}

      {/* Lawyer Cards Grid */}
      {filteredLawyers.length > 0 && (
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredLawyers.map((lawyer) => (
            <LawyerCard key={lawyer.id} lawyer={lawyer} />
          ))}
        </div>
      )}
    </div>
  );
}
