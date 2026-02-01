import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAutocomplete } from '@/hooks/use-lawyer-search';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, onSearch, placeholder = 'Search lawyers by name or specialization...', className }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  
  const { data: autocompleteData } = useAutocomplete(localValue);
  const suggestions = autocompleteData?.suggestions || [];

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the onChange callback
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localValue, onChange, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedIndex(-1);
    // Reset when suggestions change
  }, [suggestions.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        // Clear debounce timer and apply immediately
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        if (localValue !== value) {
          onChange(localValue);
        }
        onSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const selectedName = suggestions[selectedIndex].name;
          setLocalValue(selectedName);
          onChange(selectedName);
          setShowSuggestions(false);
        } else {
          // Clear debounce timer and apply immediately
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          if (localValue !== value) {
            onChange(localValue);
          }
        }
        onSearch();
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const handleSuggestionClick = (name: string) => {
    setLocalValue(name);
    onChange(name);
    setShowSuggestions(false);
    onSearch();
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className={cn('relative w-full', className)}>
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
          <Input
            type="text"
            value={localValue}
            onChange={(e) => {
              setLocalValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="pr-10 pl-10"
          />
          {localValue && (
            <button
              type="button"
              onClick={handleClear}
              className="top-1/2 right-3 absolute text-muted-foreground hover:text-foreground -translate-y-1/2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button onClick={onSearch} size="default">
          Search
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="z-50 absolute bg-popover shadow-lg mt-1 border rounded-md w-full">
          <ul className="p-1 max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.id}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion.name)}
                  className={cn(
                    'px-3 py-2 rounded-sm w-full text-sm text-left transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    selectedIndex === index && 'bg-accent text-accent-foreground'
                  )}
                >
                  <div className="font-medium">{suggestion.name}</div>
                  {suggestion.specializations?.length > 0 && (
                    <div className="text-muted-foreground text-xs">
                      {suggestion.specializations.join(', ')}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
