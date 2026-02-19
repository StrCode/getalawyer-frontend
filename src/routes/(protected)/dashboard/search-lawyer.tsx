import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchSort } from '@/components/search/SearchSort';
import { PAGE_SEO_CONFIG } from '@/config/page-seo';
import { useLawyerSearch } from '@/hooks/use-lawyer-search';
import type { SearchParams } from '@/types/lawyer-search';
import { generateProtectedPageSEO } from '@/utils/seo';

export const Route = createFileRoute('/(protected)/dashboard/search-lawyer')({
  component: SearchLawyerPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: (search.q as string) || undefined,
    specializations: search.specializations 
      ? (typeof search.specializations === 'string' 
          ? [search.specializations] 
          : (search.specializations as string[]))
      : undefined,
    minExperience: search.minExperience ? Number(search.minExperience) : undefined,
    maxExperience: search.maxExperience ? Number(search.maxExperience) : undefined,
    page: search.page ? Number(search.page) : 1,
    limit: search.limit ? Number(search.limit) : 12,
    sortBy: (search.sortBy as 'relevance' | 'experience' | 'recent') || 'relevance',
  }),
});

function SearchLawyerPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const searchParams = Route.useSearch();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.q || '');
  
  const { data, isLoading } = useLawyerSearch(searchParams);

  const seoMetadata = generateProtectedPageSEO({
    title: PAGE_SEO_CONFIG.dashboardSearch.title,
    description: PAGE_SEO_CONFIG.dashboardSearch.description,
    path: '/dashboard/search-lawyer',
  });

  const handleFiltersChange = (newFilters: SearchParams) => {
    navigate({
      search: (prev) => ({ ...prev, ...newFilters }),
    });
  };

  const handleSearch = () => {
    navigate({
      search: (prev) => ({ ...prev, q: searchQuery || undefined, page: 1 }),
    });
  };

  const handlePageChange = (page: number) => {
    navigate({
      search: (prev) => ({ ...prev, page }),
    });
  };

  const handleDidYouMeanClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    navigate({
      search: (prev) => ({ ...prev, q: suggestion, page: 1 }),
    });
  };

  const handleViewProfile = (lawyerId: string) => {
    // TODO: Navigate to lawyer profile page when implemented
    console.log('View profile:', lawyerId);
  };

  return (
      <div className="flex-1 overflow-auto">
        <div className="space-y-6 p-4 md:p-6">
          {/* Search Header */}
          <div>
            <h1 className="mb-2 font-bold text-2xl">Find a Lawyer</h1>
            <p className="text-gray-600">Search from thousands of qualified lawyers</p>
          </div>

          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />

          {/* Filters and Sort */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <SearchFilters
              filters={searchParams}
              onFiltersChange={handleFiltersChange}
            />
            <SearchSort
              value={searchParams.sortBy || 'relevance'}
              onChange={(sortBy) => handleFiltersChange({ ...searchParams, sortBy })}
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
        </div>
      </div>
  );
}
