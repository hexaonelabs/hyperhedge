import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, DollarSign, Clock, TrendingUp } from "lucide-react";
import { UserFundingUpdate } from "@nktkas/hyperliquid";

interface FundingDetailsAccordionProps {
  userFunding: UserFundingUpdate[];
  className?: string;
}

interface PaginatedFunding {
  items: UserFundingUpdate[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

const ITEMS_PER_PAGE = 10;

const FundingDetailsAccordion: React.FC<FundingDetailsAccordionProps> = ({
  userFunding,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);


  // Paginate the funding data
  const paginatedData: PaginatedFunding = useMemo(() => {
    const totalItems = userFunding.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const items = userFunding.slice(startIndex, endIndex);

    return {
      items,
      totalPages,
      currentPage,
      totalItems,
    };
  }, [userFunding, currentPage]);

  // Calculate total funding amount
  const totalFunding = useMemo(() => {
    return userFunding.reduce((acc, item) => acc + Number(item.delta.usdc || 0), 0);
  }, [userFunding]);

  // Handle page navigation
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= paginatedData.totalPages) {
      setCurrentPage(page);
    }
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    const isPositive = amount >= 0;
    return {
      formatted: `${isPositive ? "+" : ""}$${Math.abs(amount).toFixed(6)}`,
      isPositive,
    };
  };

  // Reset page when expanding/collapsing
  const toggleExpanded = () => {
    if (!isExpanded) {
      setCurrentPage(1);
    }
    setIsExpanded(!isExpanded);
  };

  if (userFunding.length === 0) {
    return null;
  }

  return (
    <div className={`bg-dark-900 border border-dark-800 rounded-xl overflow-hidden ${className}`}>
      {/* Accordion Header */}
      <button
        onClick={toggleExpanded}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-primary-400" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">
              Fundings Rates earned
            </h3>
            <p className="text-sm text-dark-400">
              {userFunding.length} transactions • Total: {formatCurrency(totalFunding).formatted}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-lg font-bold ${totalFunding >= 0 ? 'text-primary-400' : 'text-red-400'}`}>
            {formatCurrency(totalFunding).formatted}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-dark-400 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="border-t border-dark-800">
          {/* Funding Items List */}
          <div className="max-h-96 overflow-y-auto">
            {paginatedData.items.length > 0 ? (
              <div className="divide-y divide-dark-800">
                {paginatedData.items.map((item, index) => {
                  const fundingAmount = Number(item.delta.usdc || 0);
                  const { formatted, isPositive } = formatCurrency(fundingAmount);
                  
                  return (
                    <div
                      key={`${item.time}-${index}`}
                      className="px-6 py-4 hover:bg-dark-800/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-dark-800 rounded-lg">
                            <TrendingUp className={`w-4 h-4 ${isPositive ? 'text-primary-400' : 'text-red-400'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{item.delta.coin}</span>
                              <span className="text-xs text-dark-500 bg-dark-800 px-2 py-1 rounded">
                                Funding
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-dark-500" />
                              <span className="text-sm text-dark-400">
                                {formatDate(item.time)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${isPositive ? 'text-primary-400' : 'text-red-400'}`}>
                            {formatted}
                          </div>
                          {item.delta.szi && (
                            <div className="text-sm text-dark-400">
                              Size: {Number(item.delta.szi).toFixed(4)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <DollarSign className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-dark-400 mb-2">
                  Aucun funding trouvé
                </h4>
                <p className="text-dark-500 text-sm">
                  Les détails des fundings apparaîtront ici une fois que vous aurez des positions actives.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {paginatedData.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-dark-800 bg-dark-900/50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-dark-400">
                  Page {paginatedData.currentPage} sur {paginatedData.totalPages} • {paginatedData.totalItems} transactions au total
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-dark-700 bg-dark-800 text-dark-300 hover:text-white hover:border-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, paginatedData.totalPages) }, (_, i) => {
                      let pageNum;
                      if (paginatedData.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= paginatedData.totalPages - 2) {
                        pageNum = paginatedData.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            pageNum === currentPage
                              ? "bg-primary-500 text-white"
                              : "text-dark-300 hover:text-white hover:bg-dark-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === paginatedData.totalPages}
                    className="p-2 rounded-lg border border-dark-700 bg-dark-800 text-dark-300 hover:text-white hover:border-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FundingDetailsAccordion;
