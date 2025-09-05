import React from 'react';
import { Eye, ArrowLeft, Wallet, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWatchMode } from '../hooks/useWatchMode';
import { useWallet } from '../hooks/useWallet';
import { useHyperliquidConfig } from '../hooks/useHyperliquidConfig';

const AccountIndicator: React.FC = () => {
  const { isWatchMode, watchAddress, disableWatchMode } = useWatchMode();
  const { address: walletAddress } = useWallet();
  const { config } = useHyperliquidConfig();
  const navigate = useNavigate();

  const handleExitWatchMode = () => {
    disableWatchMode();
    navigate('/positions');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Déterminer l'adresse utilisée et le type de compte
  const getAccountInfo = () => {
    if (isWatchMode && watchAddress) {
      return {
        address: watchAddress,
        type: 'watch',
        label: 'Watch Mode Active',
        description: 'Analyzing portfolio',
      };
    }

    if (config?.subAccountAddress) {
      return {
        address: config.subAccountAddress,
        type: 'subaccount',
        label: 'Sub-Account Active',
        description: 'Using configured sub-account',
      };
    }

    if (walletAddress) {
      return {
        address: walletAddress,
        type: 'wallet',
        label: 'Wallet Connected',
        description: 'Using main wallet address',
      };
    }

    return null;
  };

  const accountInfo = getAccountInfo();

  if (!accountInfo) {
    return null;
  }

  const getIconAndColors = () => {
    switch (accountInfo.type) {
      case 'watch':
        return {
          icon: Eye,
          bgColor: 'bg-blue-500/5',
          borderColor: 'border-blue-500/10',
          textColor: 'text-blue-300',
          accentColor: 'text-blue-400',
          buttonBg: 'bg-blue-500/10 hover:bg-blue-500/20',
          buttonText: 'text-blue-300 hover:text-blue-200',
        };
      case 'subaccount':
        return {
          icon: User,
          bgColor: 'bg-purple-500/5',
          borderColor: 'border-purple-500/10',
          textColor: 'text-purple-300',
          accentColor: 'text-purple-400',
          buttonBg: 'bg-purple-500/10 hover:bg-purple-500/20',
          buttonText: 'text-purple-300 hover:text-purple-200',
        };
      default: // wallet
        return {
          icon: Wallet,
          bgColor: 'bg-green-500/5',
          borderColor: 'border-green-500/10',
          textColor: 'text-green-300',
          accentColor: 'text-primary-400',
          buttonBg: 'bg-green-500/10 hover:bg-green-500/20',
          buttonText: 'text-green-300 hover:text-green-200',
        };
    }
  };

  const colors = getIconAndColors();
  const IconComponent = colors.icon;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`flex items-center space-x-2 px-3 py-2 ${colors.bgColor} border ${colors.borderColor} rounded-lg`}>
          <IconComponent className={`w-4 h-4 ${colors.accentColor}`} />
          <span className="text-white text-sm font-medium">{accountInfo.label}</span>
          <span className="text-dark-400">•</span>
          <span className={`${colors.textColor} text-sm font-mono`}>
            {formatAddress(accountInfo.address)}
          </span>
        </div>
      </div>
      
      {isWatchMode && (
        <button
          onClick={handleExitWatchMode}
          className={`flex items-center space-x-1 px-3 py-2 ml-3 ${colors.buttonBg} ${colors.buttonText} rounded-lg transition-colors text-sm`}
          title="Exit Watch Mode"
        >
          <ArrowLeft size={14} />
          <span>Exit</span>
        </button>
      )}
    </div>
  );
};

export default AccountIndicator;
