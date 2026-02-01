# Lawyer Search Components

Production-grade search components for finding lawyers with full-text search, filtering, and autocomplete.

## Components

### SearchBar
Search input with real-time autocomplete suggestions.

```tsx
import { SearchBar } from '@/components/search';

<SearchBar
  value={query}
  onChange={setQuery}
  onSearch={handleSearch}
  placeholder="Search lawyers..."
/>
```

**Features:**
- Real-time autocomplete (triggers after 2 characters)
- Keyboard navigation (↑↓ arrows, Enter, Esc)
- Clear button
- Click-outside to close suggestions

### SearchFilters
Filter sidebar with specializations and experience range.

```tsx
import { SearchFilters } from '@/components/search';

<SearchFilters
  filters={searchParams}
  onFiltersChange={setSearchParams}
  onApply={handleSearch}
/>
```

**Features:**
- Multi-select specializations with counts
- Experience range (min/max)
- Active filter badges
- Clear all functionality
- Mobile-friendly sheet layout

### SearchSort
Sort dropdown for result ordering.

```tsx
import { SearchSort } from '@/components/search';

<SearchSort
  value={sortBy}
  onChange={setSortBy}
/>
```

**Options:**
- Most Relevant (default)
- Most Experienced
- Name (A-Z)

### SearchResults
Results display with pagination and empty states.

```tsx
import { SearchResults } from '@/components/search';

<SearchResults
  data={searchData}
  isLoading={isLoading}
  onViewProfile={handleViewProfile}
  onLoadMore={handleLoadMore}
  onDidYouMeanClick={handleDidYouMean}
/>
```

**Features:**
- Responsive grid layout (1/2/3 columns)
- Loading skeletons
- Empty states
- "Did you mean?" suggestions
- Load more pagination
- Results count

### LawyerCard
Individual lawyer card component.

```tsx
import { LawyerCard } from '@/components/search';

<LawyerCard
  lawyer={lawyerData}
  onViewProfile={handleViewProfile}
/>
```

**Displays:**
- Avatar with fallback initials
- Name and location
- Years of experience
- Specializations (max 3 shown)
- View profile button

## Hooks

### useLawyerSearch
Main search hook with React Query caching.

```tsx
import { useLawyerSearch } from '@/hooks/use-lawyer-search';

const { data, isLoading } = useLawyerSearch({
  q: 'criminal',
  specializations: ['criminal-law-id'],
  minExperience: 5,
  page: 1,
  limit: 12,
  sortBy: 'relevance',
});
```

### useAutocomplete
Autocomplete suggestions hook.

```tsx
import { useAutocomplete } from '@/hooks/use-lawyer-search';

const { data } = useAutocomplete(query);
```

### useSearchFilters
Available filters hook.

```tsx
import { useSearchFilters } from '@/hooks/use-lawyer-search';

const { data } = useSearchFilters({ q: 'criminal' });
```

## Types

All types are exported from `@/types/lawyer-search`:

- `SearchParams` - Search query parameters
- `SearchResponse` - API response structure
- `LawyerSearchResult` - Individual lawyer data
- `SearchPagination` - Pagination metadata
- `AvailableFilter` - Filter options with counts
- `SortOption` - Sort options type

## API Endpoints

The components use these API endpoints:

- `GET /api/search/lawyers` - Main search
- `GET /api/search/autocomplete` - Autocomplete suggestions
- `GET /api/search/filters` - Available filters

## Performance

- Search results: 30s stale time
- Autocomplete: 60s stale time
- Filters: 5min stale time
- Debounced autocomplete (2+ characters)
- Lazy loading with load more

## Accessibility

- Keyboard navigation support
- ARIA labels
- Focus management
- Screen reader friendly
- Semantic HTML

## Mobile Responsive

- Stacked layout on mobile
- Touch-friendly buttons
- Sheet component for filters
- Responsive grid (1/2/3 columns)
