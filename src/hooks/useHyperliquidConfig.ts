import { useContext } from "react";
import { HyperliquidConfigContext, HyperliquidConfigContextType } from "../contexts/HyperliquidConfigContext";

export const useHyperliquidConfig = (): HyperliquidConfigContextType => {
  const context = useContext(HyperliquidConfigContext);
  if (context === undefined) {
    throw new Error('useHyperliquidConfig must be used within a HyperliquidConfigProvider');
  }
  return context;
};

export default HyperliquidConfigContext;