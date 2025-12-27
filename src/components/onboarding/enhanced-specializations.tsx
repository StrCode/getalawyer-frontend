"use client";

import { Cancel01Icon, CheckmarkCircle02Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSpecializations } from "@/hooks/use-specializations";
import { type SpecializationData, useEnhancedOnboardingStore } from "@/stores/enhanced-onboarding-store";

interface SpecializationOption {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

export function EnhancedSpecializationsSelector() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Get store values and actions
  const specializations = useEnhancedOnboardingStore((state) => state.specializations);
  const addSpecialization = useEnhancedOnboardingStore((state) => state.addSpecialization);
  const updateSpecialization = useEnhancedOnboardingStore((state) => state.updateSpecialization);
  const removeSpecialization = useEnhancedOnboardingStore((state) => state.removeSpecialization);
  const setError = useEnhancedOnboardingStore((state) => state.setError);
  const clearError = useEnhancedOnboardingStore((state) => state.clearError);
  const errors = useEnhancedOnboardingStore((state) => state.errors);

  // Fetch specializations from API
  const { data: apiSpecializations, isLoading, error } = useSpecializations();

  // Transform API data to our format
  const availableSpecializations: SpecializationOption[] = 
    apiSpecializations?.specializations.map((spec) => ({
      id: spec.id,
      name: spec.name,
      description: spec.description,
      category: "Legal Practice" // Default category since API doesn't provide categories
    })) ?? [];

  // Get unique categories for filtering
  const categories = ["all", ...new Set(availableSpecializations.map(spec => spec.category || "Legal Practice"))];

  // Filter specializations based on search and category
  const filteredSpecializations = availableSpecializations.filter((spec) => {
    const matchesSearch = spec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (spec.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory === "all" || spec.category === selectedCategory;
    const notAlreadySelected = !specializations.some(selected => selected.specializationId === spec.id);
    
    return matchesSearch && matchesCategory && notAlreadySelected;
  });

  // Handle specialization selection
  const handleSelectSpecialization = (spec: SpecializationOption) => {
    if (specializations.length >= 5) {
      setError("specializations", ["Maximum 5 specializations allowed"]);
      return;
    }

    const newSpecialization: SpecializationData = {
      specializationId: spec.id,
      yearsOfExperience: 0,
      description: spec.name
    };

    addSpecialization(newSpecialization);
    clearError("specializations");
  };

  // Handle experience update
  const handleExperienceChange = (specializationId: string, years: string) => {
    const yearsNum = parseInt(years, 10);
    if (Number.isNaN(yearsNum) || yearsNum < 0) {
      setError("specializations", ["Years of experience must be non-negative integers"]);
      return;
    }

    updateSpecialization(specializationId, { yearsOfExperience: yearsNum });
    clearError("specializations");
  };

  // Handle specialization removal
  const handleRemoveSpecialization = (specializationId: string) => {
    removeSpecialization(specializationId);
    if (specializations.length <= 1) {
      setError("specializations", ["At least one specialization is required"]);
    }
  };

  // Get specialization name by ID
  const getSpecializationName = (id: string) => {
    const spec = availableSpecializations.find(s => s.id === id);
    return spec?.name || "Unknown Specialization";
  };

  // Validation effect
  useEffect(() => {
    if (specializations.length === 0) {
      setError("specializations", ["At least one specialization is required"]);
    } else if (specializations.length > 5) {
      setError("specializations", ["Maximum 5 specializations allowed"]);
    } else {
      const hasInvalidExperience = specializations.some(spec => 
        spec.yearsOfExperience < 0 || !Number.isInteger(spec.yearsOfExperience)
      );
      if (hasInvalidExperience) {
        setError("specializations", ["Years of experience must be non-negative integers"]);
      } else {
        clearError("specializations");
      }
    }
  }, [specializations, setError, clearError]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8">
          <p className="text-sm text-muted-foreground">Loading specializations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8">
          <p className="text-sm text-destructive">Failed to load specializations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="space-y-4">
        <div className="relative">
          <HugeiconsIcon 
            icon={Search01Icon} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" 
          />
          <Input
            placeholder="Search practice areas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Selected Specializations */}
      {specializations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-green-600" />
              Selected Specializations ({specializations.length}/5)
            </CardTitle>
            <CardDescription>
              Add years of experience for each selected practice area
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {specializations.map((spec) => (
              <div key={spec.specializationId} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{getSpecializationName(spec.specializationId)}</h4>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor={`experience-${spec.specializationId}`} className="text-sm whitespace-nowrap">
                    Years:
                  </Label>
                  <Input
                    id={`experience-${spec.specializationId}`}
                    type="number"
                    min="0"
                    value={spec.yearsOfExperience}
                    onChange={(e) => handleExperienceChange(spec.specializationId, e.target.value)}
                    className="w-20"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSpecialization(spec.specializationId)}
                  className="text-destructive hover:text-destructive"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Available Specializations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Available Practice Areas</h3>
          <Badge variant="secondary">
            {filteredSpecializations.length} available
          </Badge>
        </div>

        {filteredSpecializations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== "all" 
                ? "No specializations match your search criteria" 
                : "All available specializations have been selected"}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filteredSpecializations.map((spec) => (
              <Card 
                key={spec.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelectSpecialization(spec)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{spec.name}</h4>
                      {spec.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {spec.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      disabled={specializations.length >= 5}
                      className="ml-2"
                    >
                      Select
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Selection Summary */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              {specializations.length === 0 
                ? "No specializations selected" 
                : `${specializations.length} specialization${specializations.length === 1 ? '' : 's'} selected`}
            </p>
            <p className="text-sm text-muted-foreground">
              {specializations.length === 0 
                ? "Select at least 1 specialization to continue"
                : specializations.length >= 5 
                  ? "Maximum selections reached"
                  : `You can select ${5 - specializations.length} more`}
            </p>
          </div>
          
          {specializations.length > 0 && (
            <Badge variant={specializations.length >= 1 && specializations.length <= 5 ? "default" : "destructive"}>
              {specializations.length}/5
            </Badge>
          )}
        </div>
      </div>

      {/* Error Display */}
      {errors.specializations && errors.specializations.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <div className="text-destructive text-sm font-medium">
              {errors.specializations[0]}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}