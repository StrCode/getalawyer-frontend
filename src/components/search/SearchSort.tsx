import { ArrowUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SortOption } from '@/types/lawyer-search';

interface SearchSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'experience', label: 'Most Experienced' },
  { value: 'recent', label: 'Recently Joined' },
];

export function SearchSort({ value, onChange }: SearchSortProps) {
  const currentLabel = sortOptions.find(opt => opt.value === value)?.label || 'Sort';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex relative justify-center items-center gap-2 bg-background hover:bg-accent disabled:opacity-50 px-4 py-2 border border-input aria-invalid:border-destructive focus-visible:border-ring rounded-md focus-visible:outline-none aria-invalid:ring-destructive/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 h-10 font-medium text-sm whitespace-nowrap transition-colors hover:text-accent-foreground disabled:pointer-events-none">
        <ArrowUpDown className="mr-2 w-4 h-4" />
        {currentLabel}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={value === option.value ? 'bg-accent' : ''}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
