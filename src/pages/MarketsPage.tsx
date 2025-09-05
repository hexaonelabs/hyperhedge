import React, { useEffect, useRef } from "react";
import FundingRatesWidget from "../Widgets/FundingRatesWidget";
import { useHyperliquidProcessedData } from "../hooks/useHyperliquidProcessedData";

const MarketsPage: React.FC = () => {
  const { refreshMarketData } = useHyperliquidProcessedData();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page devient invisible - arrêter la mise à jour automatique
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Page devient visible - démarrer la mise à jour automatique
        if (!intervalRef.current) {
          // Rafraîchir immédiatement
          refreshMarketData();
          
          // Puis programmer les mises à jour toutes les 30 secondes
          intervalRef.current = setInterval(() => {
            refreshMarketData();
          }, 30000); // 30 secondes
        }
      }
    };

    // Démarrer la mise à jour automatique si la page est visible au montage
    if (!document.hidden) {
      intervalRef.current = setInterval(() => {
        refreshMarketData();
      }, 30000);
    }

    // Écouter les changements de visibilité
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Nettoyage à la destruction du composant
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshMarketData]);

  return (
    <div className="container mx-auto px-4 py-8">
      <FundingRatesWidget />
    </div>
  );
};

export default MarketsPage;
