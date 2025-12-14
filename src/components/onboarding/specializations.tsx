"use client";
import { useEffect, useState } from "react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { useOnboardingClientStore } from "@/stores/onBoardingClient";
import { useSpecializations } from "@/hooks/use-specializations";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";

export function RegisterSpecializations() {
  // Get store values
  const storeSpecializations = useOnboardingClientStore(
    (state) => state.specializations,
  );
  const setStoreSpecializations = useOnboardingClientStore(
    (state) => state.setSpecializations,
  );

  // Local state initialized from store
  const [specializations, setSpecializations] =
    useState<Array<string>>(storeSpecializations);

  // Sync local state with store on mount
  useEffect(() => {
    setSpecializations(storeSpecializations);
  }, [storeSpecializations]);

  // Fetch specializations from API
  const { data: apiSpecializations, isLoading, error } = useSpecializations();

  // Transform API data
  const LEGAL_SPECIALIZATIONS =
    apiSpecializations?.specializations.map((spec) => ({
      label: spec.name,
      value: spec.id, // UUID
    })) ?? [];

  const handleValuesChange = (values: Array<string>) => {
    // Limit to 3 selections
    if (values.length <= 3) {
      setSpecializations(values); // Update local state
      setStoreSpecializations(values); // Update store
    }
  };

  const handleRemoveSpecialization = (value: string) => {
    const newValues = specializations.filter((id) => id !== value);
    setSpecializations(newValues); // Update local state
    setStoreSpecializations(newValues); // Update store
  };

  const handleQuickSelect = (value: string) => {
    if (specializations.length < 3 && !specializations.includes(value)) {
      const newValues = [...specializations, value];
      setSpecializations(newValues); // Update local state
      setStoreSpecializations(newValues); // Update store
    }
  };

  // Get selected items for display
  const selectedItems = LEGAL_SPECIALIZATIONS.filter((spec) =>
    specializations.includes(spec.value),
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8">
          <p className="text-sm text-muted-foreground">
            Loading specializations...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8">
          <p className="text-sm text-destructive">
            Failed to load specializations
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (LEGAL_SPECIALIZATIONS.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8">
          <p className="text-sm text-muted-foreground">
            No specializations available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-2xl border px-2 py-3 w-full">
        <MultiSelect
          onValuesChange={handleValuesChange}
          values={specializations}
        >
          <MultiSelectTrigger className="w-full rounded-2xl">
            <MultiSelectValue placeholder="Search legal areas…" />
          </MultiSelectTrigger>
          <MultiSelectContent>
            <MultiSelectGroup>
              {LEGAL_SPECIALIZATIONS.map((spec) => (
                <MultiSelectItem key={spec.value} value={spec.value}>
                  {spec.label}
                </MultiSelectItem>
              ))}
            </MultiSelectGroup>
          </MultiSelectContent>
        </MultiSelect>

        {/* Selected Items Display */}
        <div className="relative rounded-3xl border bg-card bg-clip-padding px-1 py-1 shadow-xs before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)]">
          <div className="flex flex-wrap gap-2 min-h-[40px] p-2">
            {selectedItems.length > 0 ? (
              selectedItems.map((item) => (
                <Button
                  variant="secondary"
                  className="text-muted-foreground hover:text-green-500 text-sm/snug font-normal px-1 rounded-3xl flex items-center justify-between"
                  key={item.value}
                  onClick={() => handleRemoveSpecialization(item.value)}
                  type="button"
                >
                  <span className="flex text-sm/snug font-normal items-center gap-2 justify-around border px-2 rounded-3xl">
                    {item.label}
                    <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
                  </span>
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No specializations selected (max 3)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Available Quick Select */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">Quick select:</p>
        <div className="flex flex-wrap gap-2">
          {LEGAL_SPECIALIZATIONS.slice(0, 6).map((item) => (
            <Button
              variant="ghost"
              className="text-base/snug px-1 rounded-3xl flex items-center justify-between"
              key={item.value}
              onClick={() => handleQuickSelect(item.value)}
              disabled={
                specializations.length >= 3 ||
                specializations.includes(item.value)
              }
              type="button"
            >
              <span className="flex text-base/snug font-normal items-center gap-2 justify-around border px-2 rounded-3xl">
                {item.label}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
