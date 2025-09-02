import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useWallet } from "../hooks/useWallet";
import {
  clearHyperliquidConfig,
  getHyperliquidConfig,
  hasHyperliquidConfig,
  setHyperliquidConfig as saveConfig,
} from "../utils/hyperliquidConfig";
import { HyperliquidConfig } from "../types";

export interface HyperliquidConfigContextType {
  config: HyperliquidConfig;
  isLoading: boolean;
  error: string | null;
  hasConfig: boolean;
  isConfigured: boolean;
  loadConfig: () => Promise<void>;
  saveConfig: (config: HyperliquidConfig) => Promise<void>;
  clearConfig: () => void;
  refreshConfig: () => Promise<void>;
}

const HyperliquidConfigContext = createContext<
  HyperliquidConfigContextType | undefined
>(undefined);

interface HyperliquidConfigProviderProps {
  children: ReactNode;
}

const DEFAULT_CONFIG: HyperliquidConfig = {
  isTestnet: false,
};

export const HyperliquidConfigProvider: React.FC<
  HyperliquidConfigProviderProps
> = ({ children }) => {
  const { isConnected } = useWallet();
  const [config, setConfig] = useState<HyperliquidConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasConfig, setHasConfig] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if config exists in localStorage
  const checkConfigExists = () => {
    const exists = hasHyperliquidConfig();
    setHasConfig(exists);
    return exists;
  };

  // Load and decrypt config
  const loadConfig = useCallback(async (): Promise<void> => {
    if (!isConnected) {
      setError("Wallet not connected");
      return;
    }

    console.log("Loading Hyperliquid config...");

    try {
      setIsLoading(true);
      setError(null);

      if (!checkConfigExists()) {
        setConfig(DEFAULT_CONFIG);
        return;
      }

      const storedConfig = await getHyperliquidConfig();
      if (storedConfig) {
        setConfig(storedConfig);
        setError(null);
      } else {
        setError("Failed to decrypt configuration");
        setConfig(DEFAULT_CONFIG);
      }
    } catch (err) {
      console.error("Error loading Hyperliquid config:", err);
      setError("Failed to load configuration");
      setConfig(DEFAULT_CONFIG);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  // Save and encrypt config
  const saveConfigHandler = async (
    newConfig: HyperliquidConfig
  ): Promise<void> => {
    if (!isConnected) {
      throw new Error("Wallet not connected");
    }

    try {
      setIsLoading(true);
      setError(null);
      await saveConfig(newConfig);
      setConfig(newConfig);
      setHasConfig(true);
      setError(null);
    } catch (err) {
      console.error("Error saving Hyperliquid config:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save configuration";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear config from memory and storage
  const clearConfig = () => {
    clearHyperliquidConfig();
    setConfig(DEFAULT_CONFIG);
    setHasConfig(false);
    setError(null);
  };

  // Refresh config (reload from storage)
  const refreshConfig = async (): Promise<void> => {
    setConfig(DEFAULT_CONFIG);
    await loadConfig();
  };

  // Auto-load config when wallet connects
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      checkConfigExists();
      return;
    }

    if (isConnected && hasConfig && !config && !isLoading) {
      loadConfig();
    }

    // Clear config when wallet disconnects
    if (!isConnected && config) {
      setConfig(DEFAULT_CONFIG);
      setError(null);
    }
  }, [isConnected, hasConfig, config, isLoading, isInitialized, loadConfig]);

  // Computed values
  const isConfigured = Boolean(config && config.apiWalletPrivateKey);

  const contextValue: HyperliquidConfigContextType = {
    config,
    isLoading,
    error,
    hasConfig,
    isConfigured,
    loadConfig,
    saveConfig: saveConfigHandler,
    clearConfig,
    refreshConfig,
  };

  return (
    <HyperliquidConfigContext.Provider value={contextValue}>
      {children}
    </HyperliquidConfigContext.Provider>
  );
};

export { HyperliquidConfigContext };
