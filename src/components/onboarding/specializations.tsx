"use client";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectGroup,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@/components/ui/multi-select";
import { useSpecializations } from "@/hooks/use-specializations";
import { useOnboardingClientStore } from "@/stores/onBoardingClient";

export function RegisterSpecializations() {
	const storeSpecializations = useOnboardingClientStore(
		(state) => state.specializations,
	);
	const setStoreSpecializations = useOnboardingClientStore(
		(state) => state.setSpecializations,
	);

	const [specializations, setSpecializations] =
		useState<Array<string>>(storeSpecializations);

	useEffect(() => {
		setSpecializations(storeSpecializations);
	}, [storeSpecializations]);

	const { data: apiSpecializations, isLoading, error } = useSpecializations();

	const LEGAL_SPECIALIZATIONS =
		apiSpecializations?.specializations.map((spec) => ({
			label: spec.name,
			value: spec.id,
		})) ?? [];

	const handleValuesChange = (values: Array<string>) => {
		if (values.length <= 3) {
			setSpecializations(values);
			setStoreSpecializations(values);
		}
	};

	const handleRemoveSpecialization = (value: string) => {
		const newValues = specializations.filter((id) => id !== value);
		setSpecializations(newValues);
		setStoreSpecializations(newValues);
	};

	const handleQuickSelect = (value: string) => {
		if (specializations.length < 3 && !specializations.includes(value)) {
			const newValues = [...specializations, value];
			setSpecializations(newValues);
			setStoreSpecializations(newValues);
		}
	};

	const selectedItems = LEGAL_SPECIALIZATIONS.filter((spec) =>
		specializations.includes(spec.value),
	);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex justify-center items-center p-8">
					<p className="text-muted-foreground text-sm">
						Loading specializations...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-4">
				<div className="flex justify-center items-center p-8">
					<p className="text-destructive text-sm">
						Failed to load specializations
					</p>
				</div>
			</div>
		);
	}

	if (LEGAL_SPECIALIZATIONS.length === 0) {
		return (
			<div className="space-y-4">
				<div className="flex justify-center items-center p-8">
					<p className="text-muted-foreground text-sm">
						No specializations available
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Search Section */}
			<div className="space-y-2">
				<p className="font-medium text-gray-700 text-xs">Search Legal Areas</p>
				<MultiSelect
					onValuesChange={handleValuesChange}
					values={specializations}
				>
					<MultiSelectTrigger className="border hover:border-primary/50 rounded-lg w-full h-10 transition-colors">
						<MultiSelectValue placeholder="Type to search..." />
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
			</div>

			{/* Selected Items Display */}
			{selectedItems.length > 0 && (
				<div className="space-y-2">
					<p className="font-medium text-gray-700 text-xs">
						Selected ({selectedItems.length}/3)
					</p>
					<div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 border border-green-200 rounded-lg">
						<div className="flex flex-wrap gap-2">
							{selectedItems.map((item) => (
								<button
									key={item.value}
									onClick={() => handleRemoveSpecialization(item.value)}
									type="button"
									className="group inline-flex items-center gap-1.5 bg-white hover:bg-red-50 px-3 py-1.5 border border-green-300 hover:border-red-300 rounded-full font-medium text-gray-700 hover:text-red-600 text-xs transition-all duration-200"
								>
									<span>{item.label}</span>
									<HugeiconsIcon
										icon={Cancel01Icon}
										className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 transition-colors"
									/>
								</button>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
