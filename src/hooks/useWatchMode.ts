import { useContext } from 'react';
import WatchModeContext, { WatchModeContextType } from '../contexts/WatchModeContext';

export const useWatchMode = (): WatchModeContextType => {
  const context = useContext(WatchModeContext);
  if (!context) {
    throw new Error('useWatchMode must be used within a WatchModeProvider');
  }
  return context;
};
