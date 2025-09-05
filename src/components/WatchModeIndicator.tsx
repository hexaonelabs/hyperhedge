import React from 'react';
import { Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWatchMode } from '../hooks/useWatchMode';

const WatchModeIndicator: React.FC = () => {
  const { isWatchMode, watchAddress, disableWatchMode } = useWatchMode();
  const navigate = useNavigate();

  if (!isWatchMode || !watchAddress) {
    return null;
  }

  const handleExitWatchMode = () => {
    disableWatchMode();
    navigate('/positions');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Eye className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">Watch Mode Active</h3>
            <p className="text-blue-200 text-sm">
              Analyzing portfolio: <span className="font-mono">{formatAddress(watchAddress)}</span>
            </p>
          </div>
        </div>
        
        <button
          onClick={handleExitWatchMode}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 rounded-lg transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to normal mode</span>
        </button>
      </div>
      
      <div className="mt-3 pt-3 border-t border-blue-500/20">
        <p className="text-blue-200 text-xs">
          You are viewing data from an external portfolio. Trading features are disabled.
        </p>
      </div>
    </div>
  );
};

export default WatchModeIndicator;
