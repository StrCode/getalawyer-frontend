import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

const STATIC_CONFIG = {
	staleTime: 1000 * 60 * 60 * 24 * 365,
	gcTime: Infinity,
};

export function useCountriesWithStates() {
	return useQuery({
		queryKey: ["countries"],
		queryFn: () => api.countries.getCountries(),
		select: (data) => {
			// Transform countries for select
			const countries = [
				{ label: "Select a country", value: "" },
				...data.data.map((country) => ({
					label: country.name,
					value: country.code3,
				})),
			];

			// Create states map by country code
			const statesByCountry: Record<
				string,
				Array<{ label: string; value: string }>
			> = {};

			data.data.forEach((country) => {
				statesByCountry[country.code3] = [
					{ label: "Select a state/region", value: "" },
					...(country.states || []).map((state) => ({
						label: state.name,
						value: state.code,
					})),
				];
			});

			return { countries, statesByCountry };
		},
		...STATIC_CONFIG,
	});
}
