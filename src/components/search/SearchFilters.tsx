import { Filter, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useSearchFilters } from '@/hooks/use-lawyer-search';
import type { SearchParams } from '@/types/lawyer-search';

interface SearchFiltersProps {
  filters: SearchParams;
  onFiltersChange: (filters: SearchParams) => void;
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [open, setOpen] = useState(false);
  const { data: filtersData } = useSearchFilters({ q: filters.q });
  
  const availableSpecializations = filtersData?.specializations || [];
  const selectedSpecializations = filters.specializations || [];

  // Get specialization name by ID (for displaying selected filters)
  const getSpecializationName = (id: string) => {
    const spec = availableSpecializations.find(s => s.id === id);
    return spec?.name || id; // Fallback to ID if not found
  };

  const handleSpecializationToggle = (id: string) => {
    const newSpecializations = selectedSpecializations.includes(id)
      ? selectedSpecializations.filter(s => s !== id)
      : [...selectedSpecializations, id];
    
    // Apply immediately to URL
    onFiltersChange({ 
      ...filters, 
      specializations: newSpecializations.length > 0 ? newSpecializations : undefined,
      page: 1 // Reset to page 1 when filters change
    });
  };

  const handleExperienceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    // Apply immediately to URL
    onFiltersChange({
      ...filters,
      [type === 'min' ? 'minExperience' : 'maxExperience']: numValue,
      page: 1 // Reset to page 1 when filters change
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      q: filters.q,
      page: 1,
      limit: filters.limit,
      sortBy: filters.sortBy,
      specializations: undefined,
      minExperience: undefined,
      maxExperience: undefined,
    });
  };

  const activeFilterCount = 
    selectedSpecializations.length + 
    (filters.minExperience !== undefined ? 1 : 0) + 
    (filters.maxExperience !== undefined ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex relative justify-center items-center gap-2 bg-background hover:bg-accent disabled:opacity-50 px-4 py-2 border border-input aria-invalid:border-destructive focus-visible:border-ring rounded-md focus-visible:outline-none aria-invalid:ring-destructive/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 h-10 font-medium text-sm whitespace-nowrap transition-colors hover:text-accent-foreground disabled:pointer-events-none">
        <Filter className="mr-2 w-4 h-4" />
        Filters
        {activeFilterCount > 0 && (
          <Badge variant="default" className="ml-2 px-1.5 rounded-full min-w-5 h-5">
            {activeFilterCount}
          </Badge>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Lawyers</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Specializations */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <Label className="font-semibold text-base">Specializations</Label>
              {selectedSpecializations.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, specializations: [] })}
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableSpecializations.map((spec) => (
                <div key={spec.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={spec.id}
                    checked={selectedSpecializations.includes(spec.id)}
                    onCheckedChange={() => handleSpecializationToggle(spec.id)}
                  />
                  <label
                    htmlFor={spec.id}
                    className="flex-1 peer-disabled:opacity-70 font-medium text-sm leading-none cursor-pointer peer-disabled:cursor-not-allowed"
                  >
                    {spec.name}
                    <span className="ml-2 text-muted-foreground">({spec.count})</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Years of Experience */}
          <div>
            <Label className="block mb-3 font-semibold text-base">Years of Experience</Label>
            <div className="gap-4 grid grid-cols-2">
              <div>
                <Label htmlFor="minExp" className="text-sm">Minimum</Label>
                <Input
                  id="minExp"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={filters.minExperience ?? ''}
                  onChange={(e) => handleExperienceChange('min', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="maxExp" className="text-sm">Maximum</Label>
                <Input
                  id="maxExp"
                  type="number"
                  min="0"
                  placeholder="50"
                  value={filters.maxExperience ?? ''}
                  onChange={(e) => handleExperienceChange('max', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div>
              <Label className="block mb-3 font-semibold text-base">Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {selectedSpecializations.map((id) => (
                  <Badge key={id} variant="secondary" className="gap-1">
                    {getSpecializationName(id)}
                    <button
                      type="button"
                      onClick={() => handleSpecializationToggle(id)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {filters.minExperience !== undefined && (
                  <Badge variant="secondary" className="gap-1">
                    Min: {filters.minExperience}y
                    <button
                      type="button"
                      onClick={() => onFiltersChange({ ...filters, minExperience: undefined })}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.maxExperience !== undefined && (
                  <Badge variant="secondary" className="gap-1">
                    Max: {filters.maxExperience}y
                    <button
                      type="button"
                      onClick={() => onFiltersChange({ ...filters, maxExperience: undefined })}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="right-0 bottom-0 left-0 absolute space-y-2 bg-background p-4 border-t">
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
