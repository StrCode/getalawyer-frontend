export const COUNTRIES = [
	{ value: "US", label: "United States" },
	{ value: "CA", label: "Canada" },
	{ value: "GB", label: "United Kingdom" },
	{ value: "AU", label: "Australia" },
	{ value: "DE", label: "Germany" },
	{ value: "FR", label: "France" },
] as const;

export const STATES_BY_COUNTRY: Record<
	string,
	Array<{ value: string; label: string }>
> = {
	US: [
		{ value: "AL", label: "Alabama" },
		{ value: "AK", label: "Alaska" },
		{ value: "AZ", label: "Arizona" },
		{ value: "CA", label: "California" },
		{ value: "FL", label: "Florida" },
		{ value: "NY", label: "New York" },
		{ value: "TX", label: "Texas" },
	],
	CA: [
		{ value: "AB", label: "Alberta" },
		{ value: "BC", label: "British Columbia" },
		{ value: "ON", label: "Ontario" },
		{ value: "QC", label: "Quebec" },
	],
	GB: [
		{ value: "ENG", label: "England" },
		{ value: "SCT", label: "Scotland" },
		{ value: "WLS", label: "Wales" },
	],
	AU: [
		{ value: "NSW", label: "New South Wales" },
		{ value: "VIC", label: "Victoria" },
		{ value: "QLD", label: "Queensland" },
	],
};
