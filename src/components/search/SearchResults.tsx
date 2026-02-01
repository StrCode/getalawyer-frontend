import { AlertCircle, ChevronLeft, ChevronRight, Search as SearchIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { SearchResponse } from '@/types/lawyer-search';
import { LawyerCard } from './LawyerCard';

interface SearchResultsProps {
  data?: SearchResponse;
  isLoading: boolean;
  onViewProfile: (lawyerId: string) => void;
  onPageChange?: (page: number) => void;
  onDidYouMeanClick?: (suggestion: string) => void;
}

export function SearchResults({ 
  data, 
  isLoading, 
  onViewProfile, 
  onPageChange,
  onDidYouMeanClick 
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
          <div key={key} className="p-6 border rounded-lg">
            <div className="flex items-start gap-4">
              <Skeleton className="rounded-full w-16 h-16" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-48 h-5" />
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-40 h-4" />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-3/4 h-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col justify-center items-center py-12 text-center">
        <SearchIcon className="mb-4 w-12 h-12 text-muted-foreground" />
        <h3 className="mb-2 font-semibold text-lg">Start Your Search</h3>
        <p className="max-w-md text-muted-foreground">
          Search for lawyers by name, specialization, or use filters to find the perfect match for your legal needs.
        </p>
      </div>
    );
  }

  if (data.results.length === 0) {
    return (
      <div className="space-y-4">
        {data.didYouMean && onDidYouMeanClick && (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              No results found. Did you mean{' '}
              <button
                type="button"
                onClick={() => data.didYouMean && onDidYouMeanClick(data.didYouMean)}
                className="font-semibold hover:text-primary underline"
              >
                {data.didYouMean}
              </button>
              ?
            </AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col justify-center items-center py-12 border rounded-lg text-center">
          <SearchIcon className="mb-4 w-12 h-12 text-muted-foreground" />
          <h3 className="mb-2 font-semibold text-lg">No Lawyers Found</h3>
          <p className="max-w-md text-muted-foreground">
            We couldn't find any lawyers matching your search criteria. Try adjusting your filters or search terms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground text-sm">
          Found <span className="font-semibold text-foreground">{data.pagination.total}</span> lawyers
          {data.query && (
            <span> matching "<span className="font-semibold text-foreground">{data.query}</span>"</span>
          )}
        </p>
      </div>

      {/* Did You Mean */}
      {data.didYouMean && onDidYouMeanClick && (
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Showing results for your search. Did you mean{' '}
            <button
              type="button"
              onClick={() => data.didYouMean && onDidYouMeanClick(data.didYouMean)}
              className="font-semibold hover:text-primary underline"
            >
              {data.didYouMean}
            </button>
            ?
          </AlertDescription>
        </Alert>
      )}

      {/* Results Grid */}
      <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3">
        {data.results.map((lawyer) => (
          <LawyerCard
            key={lawyer.id}
            lawyer={lawyer}
            onViewProfile={onViewProfile}
          />
        ))}
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && onPageChange && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <Button
            onClick={() => onPageChange(data.pagination.page - 1)}
            disabled={data.pagination.page === 1}
            variant="outline"
            size="icon"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {/* First page */}
            {data.pagination.page > 3 && (
              <>
                <Button
                  onClick={() => onPageChange(1)}
                  variant="outline"
                  size="icon"
                >
                  1
                </Button>
                {data.pagination.page > 4 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
              </>
            )}
            
            {/* Pages around current */}
            {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1)
              .filter(page => {
                const distance = Math.abs(page - data.pagination.page);
                return distance <= 2;
              })
              .map(page => (
                <Button
                  key={page}
                  onClick={() => onPageChange(page)}
                  variant={page === data.pagination.page ? 'default' : 'outline'}
                  size="icon"
                >
                  {page}
                </Button>
              ))}
            
            {/* Last page */}
            {data.pagination.page < data.pagination.totalPages - 2 && (
              <>
                {data.pagination.page < data.pagination.totalPages - 3 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
                <Button
                  onClick={() => onPageChange(data.pagination.totalPages)}
                  variant="outline"
                  size="icon"
                >
                  {data.pagination.totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            onClick={() => onPageChange(data.pagination.page + 1)}
            disabled={data.pagination.page === data.pagination.totalPages}
            variant="outline"
            size="icon"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Pagination Info */}
      <div className="text-muted-foreground text-sm text-center">
        Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} - {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total} lawyers
      </div>
    </div>
  );
}
