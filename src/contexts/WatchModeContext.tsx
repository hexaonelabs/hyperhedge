import React, { createContext, useState, ReactNode } from 'react';

export interface WatchModeContextType {
  isWatchMode: boolean;
  watchAddress: string | null;
  enableWatchMode: (address: string) => void;
  disableWatchMode: () => void;
  setWatchAddress: (address: string | null) => void;
}

const WatchModeContext = createContext<WatchModeContextType | undefined>(undefined);

interface WatchModeProviderProps {
  children: ReactNode;
}

export const WatchModeProvider: React.FC<WatchModeProviderProps> = ({ children }) => {
  const [isWatchMode, setIsWatchMode] = useState(false);
  const [watchAddress, setWatchAddressState] = useState<string | null>(null);

  // Fonction pour valider une adresse Ethereum
  const isValidEthereumAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const enableWatchMode = (address: string) => {
    if (isValidEthereumAddress(address)) {
      setIsWatchMode(true);
      setWatchAddressState(address);
    }
  };

  const disableWatchMode = () => {
    setIsWatchMode(false);
    setWatchAddressState(null);
  };

  const setWatchAddress = (address: string | null) => {
    if (address && isValidEthereumAddress(address)) {
      setIsWatchMode(true);
      setWatchAddressState(address);
    } else {
      setIsWatchMode(false);
      setWatchAddressState(null);
    }
  };

  return (
    <WatchModeContext.Provider value={{
      isWatchMode,
      watchAddress,
      enableWatchMode,
      disableWatchMode,
      setWatchAddress
    }}>
      {children}
    </WatchModeContext.Provider>
  );
};

export default WatchModeContext;
