import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchSort } from '@/components/search/SearchSort';
import { SEOHead } from '@/components/seo/SEOHead';
import { useLawyerSearch } from '@/hooks/use-lawyer-search';
import type { SearchParams } from '@/types/lawyer-search';
import { generateSearchPageSEO, generateSearchResultsSEO } from '@/utils/seo';

// Define search params schema for the route
type SearchLawyerSearch = {
  q?: string;
  specializations?: string[];
  minExperience?: number;
  maxExperience?: number;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'experience' | 'recent';
};

export const Route = createFileRoute('/(public)/search-lawyer')({
  component: SearchLawyerPage,
  validateSearch: (search: Record<string, unknown>): SearchLawyerSearch => {
    return {
      q: search.q as string | undefined,
      specializations: Array.isArray(search.specializations) 
        ? search.specializations as string[]
        : typeof search.specializations === 'string'
        ? [search.specializations]
        : undefined,
      minExperience: search.minExperience ? Number(search.minExperience) : undefined,
      maxExperience: search.maxExperience ? Number(search.maxExperience) : undefined,
      page: search.page ? Number(search.page) : 1,
      limit: search.limit ? Number(search.limit) : 20,
      sortBy: (search.sortBy as 'relevance' | 'experience' | 'recent') || 'recent',
    };
  },
});

function SearchLawyerPage() {
  const navigate = useNavigate();
  const searchParams = Route.useSearch();

  const { data, isLoading } = useLawyerSearch(searchParams);

  // Generate SEO metadata
  const seoMetadata = generateSearchPageSEO({
    query: searchParams.q,
    specializations: searchParams.specializations,
  });

  // Update structured data when results change
  useEffect(() => {
    if (data) {
      const resultsSchema = generateSearchResultsSEO({
        total: data.pagination.total,
        query: searchParams.q,
        specializations: searchParams.specializations,
      });
      
      // Update the structured data
      let script = document.querySelector('script[data-type="search-results"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-type', 'search-results');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(resultsSchema);
    }
  }, [data, searchParams.q, searchParams.specializations]);

  const updateSearchParams = (updates: Partial<SearchParams>) => {
    navigate({
      search: (prev) => ({ ...prev, ...updates }),
    });
  };

  const handleSearch = () => {
    updateSearchParams({ page: 1 });
  };

  const handleFiltersChange = (newFilters: SearchParams) => {
    navigate({
      search: newFilters,
    });
  };

  const handleSortChange = (sortBy: SearchParams['sortBy']) => {
    // If switching to relevance but no search query, use recent instead
    const effectiveSortBy = sortBy === 'relevance' && !searchParams.q ? 'recent' : sortBy;
    updateSearchParams({ sortBy: effectiveSortBy, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDidYouMeanClick = (suggestion: string) => {
    updateSearchParams({ q: suggestion, page: 1 });
  };

  const handleViewProfile = (lawyerId: string) => {
    navigate({ to: `/lawyer/${lawyerId}` });
  };

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      
      <div className="bg-background min-h-screen">
        {/* Header */}
        <header className="bg-card border-b">
          <div className="mx-auto px-4 py-8 container">
            <h1 className="mb-2 font-bold text-3xl">Find a Lawyer</h1>
            <p className="mb-6 text-muted-foreground">
              Search from thousands of qualified lawyers across the country
            </p>
            
            <SearchBar
              value={searchParams.q || ''}
              onChange={(q) => updateSearchParams({ q })}
              onSearch={handleSearch}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto px-4 py-8 container">
          {/* Filters and Sort */}
          <div className="flex justify-between items-center mb-6">
            <SearchFilters
              filters={searchParams}
              onFiltersChange={handleFiltersChange}
            />
            <SearchSort
              value={searchParams.sortBy || 'recent'}
              onChange={handleSortChange}
            />
          </div>

          {/* Results */}
          <SearchResults
            data={data}
            isLoading={isLoading}
            onViewProfile={handleViewProfile}
            onPageChange={handlePageChange}
            onDidYouMeanClick={handleDidYouMeanClick}
          />
        </main>
      </div>
    </>
  );
}
