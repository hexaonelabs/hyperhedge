import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
  AlertCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import HedgeForm from "../components/HedgeForm";
import { FundingRate } from "../types";
import { useHyperliquidProcessedData } from "../hooks/useHyperliquidProcessedData";

type SortKey =
  | "symbol"
  | "fundingRate"
  | "markPrice"
  | "volume24h"
  | "openInterest";
type SortDirection = "asc" | "desc";

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const FundingRatesWidget: React.FC = () => {
  const { fundingRates, isLoading, error, refreshMarketData: refetch } = useHyperliquidProcessedData();
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "fundingRate",
    direction: "desc",
  });
  const [displayCount, setDisplayCount] = useState(20);
  const [searchTerm, /* setSearchTerm */] = useState("");
  const [isHedgeFormOpen, setIsHedgeFormOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<FundingRate | null>(
    null
  );

  // Scroll infini
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop !==
      document.documentElement.offsetHeight
    )
      return;
    if (displayCount >= fundingRates.length) return;
    setDisplayCount((prev) => Math.min(prev + 20, fundingRates.length));
  }, [fundingRates.length, displayCount]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Tri et filtrage
  const sortedAndFilteredRates = useMemo(() => {
    const filtered = fundingRates.filter((rate) =>
      rate.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortConfig.key) {
        case "symbol":
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        case "fundingRate":
          aValue = a.fundingRate;
          bValue = b.fundingRate;
          break;
        case "markPrice":
          aValue = a.markPrice;
          bValue = b.markPrice;
          break;
        case "volume24h":
          aValue = a.volume24h;
          bValue = b.volume24h;
          break;
        case "openInterest":
          aValue = a.openInterest;
          bValue = b.openInterest;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return filtered.slice(0, displayCount);
  }, [fundingRates, sortConfig, displayCount, searchTerm]);

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  const handleOpenHedgeForm = (market: FundingRate) => {
    setSelectedMarket(market);
    setIsHedgeFormOpen(true);
  };

  const handleCloseHedgeForm = () => {
    setIsHedgeFormOpen(false);
    setSelectedMarket(null);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    }
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    }
    return `$${Number(num.toFixed(2)).toLocaleString()}`;
  };

  const formatAnnualizedFundingRate = (rate: number) => {
    // Funding rates sont payés toutes les heures, donc 24 fois par jour
    // Annualisé = rate * 24 * 365
    const annualizedRate = rate * 24 * 365;
    const percentage = (annualizedRate * 100).toFixed(2);
    return `${annualizedRate >= 0 ? "+" : ""}${percentage}%`;
  };

  const SortButton: React.FC<{
    column: SortKey;
    children: React.ReactNode;
  }> = ({ column, children }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 hover:text-white transition-colors w-full text-left"
    >
      {children}
      <div className="flex flex-col">
        <ChevronUp
          size={12}
          className={`${
            sortConfig.key === column && sortConfig.direction === "asc"
              ? "text-primary-400"
              : "text-dark-500"
          }`}
        />
        <ChevronDown
          size={12}
          className={`${
            sortConfig.key === column && sortConfig.direction === "desc"
              ? "text-primary-400"
              : "text-dark-500"
          } -mt-1`}
        />
      </div>
    </button>
  );

  return (
    <section className="py-16 bg-dark-950">
      <div className="mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Funding Rates Markets
            </h2>
            <button
              onClick={refetch}
              disabled={isLoading}
              className="inline-flex items-center p-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh data"
            >
              <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Real-time funding rates from Hyperliquid perpetual markets
          </p>
        </div>

        {/* Barre de recherche */}
        {/* <div className="mb-6">
          <input
            type="text"
            placeholder="Search markets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md mx-auto block px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div> */}

        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle size={20} />
              <span className="font-medium">Error loading funding rates:</span>
            </div>
            <p className="text-red-300 mt-1">{error}</p>
            <button
              onClick={refetch}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="bg-dark-900/50 rounded-lg overflow-hidden">
          {isLoading && fundingRates.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4">
                <RefreshCw
                  size={32}
                  className="animate-spin text-primary-400"
                />
                <p className="text-dark-300">Loading funding rates...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Version Desktop - Tableau */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-dark-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                        <SortButton column="symbol">Market</SortButton>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                        <SortButton column="markPrice">Mark Price</SortButton>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                        <SortButton column="fundingRate">
                          Funding Rate (Annual)
                        </SortButton>
                      </th>
                      {/* <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                      Next Funding
                    </th> */}
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                        <SortButton column="volume24h">24h Volume</SortButton>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                        <SortButton column="openInterest">
                          Open Interest
                        </SortButton>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700">
                    {sortedAndFilteredRates.map((rate, index) => (
                      <tr
                        key={`${rate.symbol}-${index}`}
                        className="hover:bg-dark-800/50 transition-colors cursor-pointer"
                        onClick={() => handleOpenHedgeForm(rate)}
                      >
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-white">
                              {rate.symbol}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="text-sm text-white">
                            ${rate.markPrice.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div
                            className={`flex items-center text-sm font-medium ${
                              rate.fundingRate >= 0
                                ? "text-success-400"
                                : "text-red-400"
                            }`}
                          >
                            {rate.fundingRate >= 0 ? (
                              <TrendingUp size={16} className="mr-1" />
                            ) : (
                              <TrendingDown size={16} className="mr-1" />
                            )}
                            {formatAnnualizedFundingRate(rate.fundingRate)}
                          </div>
                        </td>
                        {/* <td className="px-6 py-6 whitespace-nowrap">
                        <div className="text-sm text-dark-300">{rate.nextFunding}</div>
                      </td> */}
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {formatNumber(rate.volume24h)}
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {formatNumber(rate.openInterest)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Version Mobile - Cards */}
              <div className="lg:hidden p-4 space-y-4">
                {sortedAndFilteredRates.map((rate, index) => (
                  <div
                    key={`${rate.symbol}-${index}`}
                    className="bg-dark-800/50 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-white">
                        {rate.symbol}
                      </div>
                      <div
                        className={`flex items-center text-sm font-medium ${
                          rate.fundingRate >= 0
                            ? "text-success-400"
                            : "text-red-400"
                        }`}
                      >
                        {rate.fundingRate >= 0 ? (
                          <TrendingUp size={16} className="mr-1" />
                        ) : (
                          <TrendingDown size={16} className="mr-1" />
                        )}
                        {formatAnnualizedFundingRate(rate.fundingRate)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-dark-400">Mark Price</div>
                        <div className="text-white font-medium">
                          ${rate.markPrice.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-dark-400">Next Funding</div>
                        <div className="text-dark-300">{rate.nextFunding}</div>
                      </div>
                      <div>
                        <div className="text-dark-400">24h Volume</div>
                        <div className="text-white font-medium">
                          {formatNumber(rate.volume24h)}
                        </div>
                      </div>
                      <div>
                        <div className="text-dark-400">Open Interest</div>
                        <div className="text-white font-medium">
                          {formatNumber(rate.openInterest)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenHedgeForm(rate)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-black text-sm font-medium rounded-lg transition-colors"
                    >
                      <DollarSign size={16} className="mr-1" />
                      Create Position
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Indicateur de chargement pour scroll infini */}
        {displayCount < fundingRates.length && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-dark-400">
              <RefreshCw size={16} className="animate-spin" />
              <span>Loading more...</span>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className={`w-2 h-2 rounded-full ${
                isLoading
                  ? "bg-yellow-400 animate-pulse"
                  : error
                  ? "bg-red-400"
                  : "bg-primary-400"
              }`}
            ></div>
            <p className="text-sm text-dark-400">
              {isLoading
                ? "Updating..."
                : error
                ? "Connection error"
                : `Showing ${sortedAndFilteredRates.length} of ${fundingRates.length} markets`}
            </p>
          </div>
          <p className="text-sm text-dark-400 mb-4">
            Funding rates are paid every hour. Positive rates you get paid while negative rates you pay.
          </p>
        </div>
      </div>

      {/* HedgeForm Modal */}
      <HedgeForm
        isOpen={isHedgeFormOpen}
        onClose={handleCloseHedgeForm}
        selectedMarket={selectedMarket}
      />
    </section>
  );
};

export default FundingRatesWidget;
