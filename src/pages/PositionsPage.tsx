import React, { useEffect, useMemo, useRef } from "react";
import {
  TrendingUp,
  PieChart,
  Activity,
  DollarSign,
  Eye,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useHyperliquidConfig } from "../hooks/useHyperliquidConfig";
import FundingsChart from "../components/FundingsChart";
import { useHyperliquidProcessedData } from "../hooks/useHyperliquidProcessedData";
import PortfolioChart from "../components/PortfolioChat";
import { useWallet } from "../hooks/useWallet";
import {PositionsWidget} from "../components/PositionsWidget";
import { useWatchMode } from "../hooks/useWatchMode";
import WatchModeInput from "../components/WatchModeInput";
import AccountIndicator from "../components/AccountIndicator";

const PositionsPage: React.FC = () => {
  const { address, openConnectModal } = useWallet();
  const { address: urlAddress } = useParams<{ address: string }>();
  const { isWatchMode, watchAddress, setWatchAddress } = useWatchMode();
  const {
    accountFundingHistory,
    hedgePositions,
    isLoading: loading,
    totalAccountValueUSD,
    accountPnl,
    raw: { portfolioMetrics, spotClearinghouseState, clearinghouseState },
    refreshUserData,
  } = useHyperliquidProcessedData();
  const { config } = useHyperliquidConfig();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // State pour gérer l'affichage du formulaire de watch mode
  const [showWatchModeInput, setShowWatchModeInput] = React.useState(false);
  // State pour gérer les changements non sauvegardés
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // Fonction pour valider une adresse Ethereum
  const isValidEthereumAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // En mode watch, utiliser l'adresse du watch mode, sinon utiliser l'adresse configurée ou connectée
  const addressToCheck = isWatchMode
    ? watchAddress
    : config?.subAccountAddress || address;

  // Effet pour synchroniser l'URL avec le watch mode
  useEffect(() => {
    if (urlAddress && isValidEthereumAddress(urlAddress)) {
      // Activer le watch mode avec l'adresse de l'URL
      setWatchAddress(urlAddress);
    } else if (!urlAddress && isWatchMode) {
      // Désactiver le watch mode si on n'est plus sur une URL avec adresse
      setWatchAddress(null);
    }
  }, [urlAddress, setWatchAddress, isWatchMode]);

  // Effet pour rafraîchir les données quand l'adresse watch change
  useEffect(() => {
    if (isWatchMode && watchAddress) {
      // Déclencher le rafraîchissement des données pour la nouvelle adresse
      refreshUserData();
    }
  }, [isWatchMode, watchAddress, refreshUserData]);

  // Mise à jour automatique des données de compte toutes les 30 secondes quand la page est visible
  useEffect(() => {
    // Ne démarrer la mise à jour automatique que si on a une adresse à surveiller
    // et qu'il n'y a pas de changements non sauvegardés
    if (!addressToCheck || hasUnsavedChanges) {
      // Si on a des changements non sauvegardés, arrêter le refresh automatique
      if (hasUnsavedChanges && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page devient invisible - arrêter la mise à jour automatique
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Page devient visible - démarrer la mise à jour automatique
        // seulement s'il n'y a pas de changements non sauvegardés
        if (!intervalRef.current && !hasUnsavedChanges) {
          // Rafraîchir immédiatement
          refreshUserData();

          // Puis programmer les mises à jour toutes les 30 secondes
          intervalRef.current = setInterval(() => {
            refreshUserData();
          }, 30000); // 30 secondes
        }
      }
    };

    // Démarrer la mise à jour automatique si la page est visible au montage
    // et qu'il n'y a pas de changements non sauvegardés
    if (!document.hidden && !hasUnsavedChanges) {
      intervalRef.current = setInterval(() => {
        refreshUserData();
      }, 30000);
    }

    // Écouter les changements de visibilité
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Nettoyage à la destruction du composant
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [addressToCheck, refreshUserData, hasUnsavedChanges]);

  const portfolioData = useMemo(() => {
    if (!portfolioMetrics?.[3]?.[1]) return [];

    return portfolioMetrics[3][1].accountValueHistory.map((item) => ({
      time: item[0],
      portfolioValue: Number(item[1]),
    }));
  }, [portfolioMetrics]);

  // Calculate statistics from positions
  const stats = React.useMemo(() => {
    if (!hedgePositions || hedgePositions.length === 0) {
      return {
        totalValue: 0,
        activePositions: 0,
        totalMargin: 0,
        averageLeverage: 0,
        pnl: 0,
      };
    }
    const totalValue = totalAccountValueUSD || 0;
    const totalMargin = hedgePositions.reduce(
      (sum, pos) => sum + pos.margin,
      0
    );
    const averageLeverage =
      hedgePositions.reduce((sum, pos) => sum + pos.leverage, 0) /
      hedgePositions.length;

    return {
      totalValue,
      activePositions: hedgePositions.length,
      totalMargin,
      averageLeverage,
      pnl: accountPnl,
    };
  }, [hedgePositions, totalAccountValueUSD, accountPnl]);

  // Affichage de la section de connexion seulement si pas en mode watch et pas d'adresse
  if (!addressToCheck && !isWatchMode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-8 max-w-md w-full">
            {!showWatchModeInput ? (
              <div className="text-center">
                <div className="p-4 bg-primary-500/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <TrendingUp className="w-10 h-10 text-primary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Connect Your Wallet
                </h2>
                <p className="text-dark-300 mb-6 leading-relaxed">
                  To access your positions and funding stats, connect your
                  wallet and unlock all features.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-dark-400 text-sm">
                    <div className="w-2 h-2 bg-primary-400 rounded-full mr-3"></div>
                    Real-time position tracking
                  </div>
                  <div className="flex items-center text-dark-400 text-sm">
                    <div className="w-2 h-2 bg-primary-400 rounded-full mr-3"></div>
                    Advanced risk management
                  </div>
                  <div className="flex items-center text-dark-400 text-sm">
                    <div className="w-2 h-2 bg-primary-400 rounded-full mr-3"></div>
                    Detailed analytics
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => openConnectModal()}
                    className="w-full btn-primary font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    Connect Wallet
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-dark-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-dark-900 text-dark-400">or</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowWatchModeInput(true)}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white border border-dark-700 hover:border-dark-600 rounded-lg transition-colors duration-200"
                  >
                    <Eye size={18} />
                    <span>Analyze a Portfolio</span>
                  </button>
                </div>
              </div>
            ) : (
              <WatchModeInput onClose={() => setShowWatchModeInput(false)} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && hedgePositions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Your Positions</h1>
          <p className="text-dark-300">
            Track and manage all your open positions across different markets.
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mb-4"></div>
            <p className="text-dark-300">Loading your positions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isWatchMode ? "Portfolio Analysis" : "Your Positions"}
          </h1>
          <p className="text-dark-300">
            {isWatchMode
              ? "Detailed analysis of the selected portfolio."
              : "Track and manage all your open positions across different markets."}
          </p>
        </div>
        
        {/* Account indicator aligned with title */}
        <AccountIndicator />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary-400" />
            </div>
            <span className="text-dark-400 text-sm">USD</span>
          </div>
          <h3 className="text-white font-semibold">Total Value</h3>
          <p className="text-2xl font-bold text-white">
            ${stats.totalValue.toFixed(2)}
          </p>
        </div>

        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <PieChart className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-dark-400 text-sm">Active</span>
          </div>
          <h3 className="text-white font-semibold">Open Positions</h3>
          <p className="text-2xl font-bold text-white">
            {stats.activePositions}
          </p>
        </div>

        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-orange-400" />
            </div>
            <span className="text-primary-400 text-sm">Avg</span>
          </div>
          <h3 className="text-white font-semibold">Avg Leverage</h3>
          <p className="text-2xl font-bold text-white">
            {stats.averageLeverage.toFixed(2)}x
          </p>
        </div>

        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary-400" />
            </div>
            <span className="text-dark-400 text-sm">USD</span>
          </div>
          <h3 className="text-white font-semibold">Account PnL</h3>
          <p
            className={`text-2xl font-bold ${
              stats.pnl < 0 ? "text-red-400" : "text-primary-400"
            }`}
          >
            ${stats.pnl.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Portfolio Chart */}
      {portfolioData && portfolioData.length > 0 && (
        <PortfolioChart data={portfolioData} className="mb-6" />
      )}

      {/* Funding Rates Chart */}
      {accountFundingHistory && (
        <FundingsChart
          data={accountFundingHistory.data}
          totalDays={accountFundingHistory.totalDays}
          apyPercentage={accountFundingHistory.apyPercentage}
          initialAmountUSD={accountFundingHistory.initialAmountUSD}
          className="mb-6"
        />
      )}

      {/* Position Widget */}
      <PositionsWidget
        hedgePositions={hedgePositions}
        spotClearinghouseState={spotClearinghouseState}
        clearinghouseState={clearinghouseState}
        totalAccountValueUSD={totalAccountValueUSD}
        isWatchMode={isWatchMode}
        onUnsavedChanges={setHasUnsavedChanges}
      />
    </div>
  );
};

export default PositionsPage;
