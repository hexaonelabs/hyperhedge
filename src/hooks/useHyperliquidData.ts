import { useContext } from "react";
import HyperliquidDataContext, {
  HyperliquidDataContextType,
} from "../contexts/HyperliquidDataContext";

export const useHyperliquidData = (): HyperliquidDataContextType => {
  const context = useContext(HyperliquidDataContext);
  if (!context) {
    throw new Error(
      "useHyperliquidData doit être utilisé dans un HyperliquidDataProvider"
    );
  }
  return context;
};
