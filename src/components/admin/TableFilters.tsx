import { format } from "date-fns"
import { CalendarIcon, Filter, FolderOpen, Save, X } from "lucide-react"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface FilterField {
  id: string
  label: string
  type: "text" | "select" | "date" | "dateRange" | "multiSelect"
  options?: Array<{ value: string; label: string }>
  placeholder?: string
}

export interface FilterPreset {
  id: string
  name: string
  filters: Record<string, unknown>
  createdAt: string
  isDefault?: boolean
}

export interface TableFiltersProps {
  fields: FilterField[]
  filters: Record<string, unknown>
  onFiltersChange: (filters: Record<string, unknown>) => void
  presets?: FilterPreset[]
  onSavePreset?: (name: string, filters: Record<string, unknown>) => void
  onLoadPreset?: (preset: FilterPreset) => void
  onDeletePreset?: (presetId: string) => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
}

export function TableFilters({
  fields,
  filters,
  onFiltersChange,
  presets = [],
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
}: TableFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)
  const [isSavePresetOpen, setIsSavePresetOpen] = React.useState(false)
  const [presetName, setPresetName] = React.useState("")
  const [searchDebounced, setSearchDebounced] = React.useState(searchValue)

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange?.(searchDebounced)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchDebounced, onSearchChange])

  React.useEffect(() => {
    setSearchDebounced(searchValue)
  }, [searchValue])

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== "" && value !== null
  ).length

  const handleFilterChange = (fieldId: string, value: unknown) => {
    const newFilters = { ...filters }
    if (value === undefined || value === "" || value === null) {
      delete newFilters[fieldId]
    } else {
      newFilters[fieldId] = value
    }
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), filters)
      setPresetName("")
      setIsSavePresetOpen(false)
    }
  }

  const renderFilterField = (field: FilterField) => {
    const value = filters[field.id]

    switch (field.type) {
      case "text":
        return (
          <Input
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => handleFilterChange(field.id, e.target.value)}
          />
        )

      case "select":
        return (
          <Select
            value={value || ""}
            onValueChange={(val) => handleFilterChange(field.id, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : field.placeholder || "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleFilterChange(field.id, date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )

      case "dateRange": {
        const [startDate, endDate] = value || []
        return (
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(new Date(startDate), "PP") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate ? new Date(startDate) : undefined}
                  onSelect={(date) => 
                    handleFilterChange(field.id, [date?.toISOString(), endDate])
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(new Date(endDate), "PP") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate ? new Date(endDate) : undefined}
                  onSelect={(date) => 
                    handleFilterChange(field.id, [startDate, date?.toISOString()])
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="flex items-center gap-4 py-4">
      {/* Search Input */}
      <Input
        placeholder={searchPlaceholder}
        value={searchDebounced}
        onChange={(e) => setSearchDebounced(e.target.value)}
        className="max-w-sm"
      />

      {/* Filter Button */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-auto p-1 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>
            
            {fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                {renderFilterField(field)}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Filter Presets */}
      {(presets.length > 0 || onSavePreset) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FolderOpen className="mr-2 h-4 w-4" />
              Presets
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filter Presets</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {presets.map((preset) => (
              <DropdownMenuItem
                key={preset.id}
                onClick={() => onLoadPreset?.(preset)}
                className="flex items-center justify-between"
              >
                <span>{preset.name}</span>
                {preset.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    Default
                  </Badge>
                )}
                {onDeletePreset && !preset.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 ml-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeletePreset(preset.id)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </DropdownMenuItem>
            ))}
            
            {onSavePreset && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsSavePresetOpen(true)}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Current Filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null
            
            const field = fields.find(f => f.id === key)
            if (!field) return null

            let displayValue = value
            if (field.type === "select" && field.options) {
              const option = field.options.find(opt => opt.value === value)
              displayValue = option?.label || value
            } else if (field.type === "date") {
              displayValue = format(new Date(value), "PP")
            } else if (field.type === "dateRange" && Array.isArray(value)) {
              const [start, end] = value
              displayValue = `${start ? format(new Date(start), "PP") : "?"} - ${end ? format(new Date(end), "PP") : "?"}`
            }

            return (
              <Badge key={key} variant="secondary" className="gap-1">
                {field.label}: {displayValue}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => handleFilterChange(key, undefined)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Save Preset Dialog */}
      <Dialog open={isSavePresetOpen} onOpenChange={setIsSavePresetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Give your current filter configuration a name to save it for later use.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="preset-name">Preset Name</Label>
            <Input
              id="preset-name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Enter preset name..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSavePresetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}