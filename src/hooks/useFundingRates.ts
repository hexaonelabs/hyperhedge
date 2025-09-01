import { useState, useEffect } from 'react';
import { fetchFundingRates } from '../services/hl-api.sevice';
import { FundingRate } from '../types';

interface UseFundingRatesReturn {
  fundingRates: FundingRate[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useFundingRates = (isTestNet: boolean): UseFundingRatesReturn => {
  const [fundingRates, setFundingRates] = useState<FundingRate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (testNet: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFundingRates(testNet);
      setFundingRates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching funding rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(isTestNet);
    if (!isTestNet) {
      const interval = setInterval(() => fetchData(isTestNet), 30000);
      return () => clearInterval(interval);
    } else {
      return () => {};
    }
  }, [isTestNet]);

  const refetch = () => {
    fetchData(isTestNet);
  };

  return {
    fundingRates,
    loading,
    error,
    refetch,
  };
};
