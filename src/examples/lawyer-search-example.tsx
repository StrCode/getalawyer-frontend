/**
 * Lawyer Search System - Usage Examples
 * 
 * This file demonstrates how to use the lawyer search components
 * in different scenarios.
 */

import { useState } from 'react';
import { SearchBar, SearchFilters, SearchResults, SearchSort } from '@/components/search';
import { useLawyerSearch } from '@/hooks/use-lawyer-search';
import type { SearchParams } from '@/types/lawyer-search';

/**
 * Example 1: Basic Search Implementation
 */
export function BasicSearchExample() {
  const [query, setQuery] = useState('');
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    limit: 12,
  });

  const { data, isLoading } = useLawyerSearch(searchParams);

  const handleSearch = () => {
    setSearchParams(prev => ({ ...prev, q: query, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <SearchBar
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
      />
      <SearchResults
        data={data}
        isLoading={isLoading}
        onViewProfile={(id) => console.log('View profile:', id)}
      />
    </div>
  );
}

/**
 * Example 2: Search with Filters
 */
export function SearchWithFiltersExample() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    limit: 12,
    sortBy: 'relevance',
  });

  const { data, isLoading } = useLawyerSearch(searchParams);

  const handleSearch = () => {
    setSearchParams(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <SearchBar
        value={searchParams.q || ''}
        onChange={(q) => setSearchParams(prev => ({ ...prev, q }))}
        onSearch={handleSearch}
      />
      
      <div className="flex justify-between items-center">
        <SearchFilters
          filters={searchParams}
          onFiltersChange={setSearchParams}
          onApply={handleSearch}
        />
        <SearchSort
          value={searchParams.sortBy || 'relevance'}
          onChange={(sortBy) => setSearchParams(prev => ({ ...prev, sortBy, page: 1 }))}
        />
      </div>

      <SearchResults
        data={data}
        isLoading={isLoading}
        onViewProfile={(id) => console.log('View profile:', id)}
        onLoadMore={() => setSearchParams(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
        onDidYouMeanClick={(suggestion) => setSearchParams(prev => ({ ...prev, q: suggestion, page: 1 }))}
      />
    </div>
  );
}

/**
 * Example 3: Programmatic Search
 */
export function ProgrammaticSearchExample() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    specializations: ['criminal-law-id'],
    minExperience: 5,
    page: 1,
    limit: 12,
  });

  const { data, isLoading } = useLawyerSearch(searchParams);

  // Programmatically update search
  const searchCriminalLawyers = () => {
    setSearchParams({
      q: 'criminal',
      specializations: ['criminal-law-id'],
      minExperience: 5,
      page: 1,
      limit: 12,
    });
  };

  const searchCorporateLawyers = () => {
    setSearchParams({
      q: 'corporate',
      specializations: ['corporate-law-id'],
      minExperience: 10,
      page: 1,
      limit: 12,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button onClick={searchCriminalLawyers}>
          Find Criminal Lawyers (5+ years)
        </button>
        <button onClick={searchCorporateLawyers}>
          Find Corporate Lawyers (10+ years)
        </button>
      </div>

      <SearchResults
        data={data}
        isLoading={isLoading}
        onViewProfile={(id) => console.log('View profile:', id)}
      />
    </div>
  );
}

/**
 * Example 4: Custom Result Handling
 */
export function CustomResultHandlingExample() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    q: 'family law',
    page: 1,
    limit: 12,
  });

  const { data, isLoading } = useLawyerSearch(searchParams);

  const handleViewProfile = (lawyerId: string) => {
    // Custom navigation logic
    window.location.href = `/lawyer/${lawyerId}`;
  };

  const handleContactLawyer = (lawyerId: string) => {
    // Custom contact logic
    console.log('Contact lawyer:', lawyerId);
  };

  return (
    <div className="space-y-6">
      <SearchBar
        value={searchParams.q || ''}
        onChange={(q) => setSearchParams(prev => ({ ...prev, q }))}
        onSearch={() => setSearchParams(prev => ({ ...prev, page: 1 }))}
      />

      {data && !isLoading && (
        <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3">
          {data.results.map((lawyer) => (
            <div key={lawyer.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{lawyer.name}</h3>
              <p className="text-muted-foreground text-sm">
                {lawyer.yearsOfExperience} years experience
              </p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleViewProfile(lawyer.id)}>
                  View Profile
                </button>
                <button onClick={() => handleContactLawyer(lawyer.id)}>
                  Contact
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
