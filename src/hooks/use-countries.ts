//

import { api } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

// Define the shape of your data
interface State {
  value: string;
  label: string;
}

interface Country {
  value: string;
  label: string;
  states_data: State[]; // This comes from your PostgreSQL JSONB column
}

// Data is considered fresh for 1 year and is never garbage collected
const STATIC_CONFIG = {
  staleTime: 1000 * 60 * 60 * 24 * 365,
  gcTime: Infinity,
};

// Fetches the list of all countries
const useCountries = () => useQuery({
  queryKey: ['countries'],
  queryFn: () => api.countries.getCountries(),
  ...STATIC_CONFIG,
});

export function useCountriesWithStates() {
  return useQuery({
    queryKey: ['onboarding-location-data'],

    queryFn: () => api.countries.getCountries(),
    // The 'select' function transforms the raw data for easier use in the component
    select: (data) => {
      const countries: Country[] = [];
      console.log(data)
    },
    ...STATIC_CONFIG,
  });
}

// Fetches the list of all countries, including their JSONB states data
// const useCountriesWithStates = () => useQuery({
//   queryKey: ['countriesWithStates'],
//   queryFn: async () => {
//     // API endpoint returns: [{ id: 1, name: 'US', states_data: [...] }, ...]
//     const response = await fetch('/api/countries-with-states');
//     if (!response.ok) throw new Error('Failed to fetch data');
//     return response.json();
//   },
//   ...STATIC_CONFIG,
// });

// Fetches states for a *specific* country ID
const useStates = (countryCode: string) => useQuery({
  queryKey: ['states', countryCode],
  queryFn: () => api.countries.getStatesbyCountry(countryCode),
  enabled: !!countryCode, // Only run the query if a country is selected
  ...STATIC_CONFIG,
});
