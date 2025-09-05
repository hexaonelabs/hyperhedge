import React, { useState } from 'react';
import { Eye, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWatchMode } from '../hooks/useWatchMode';

interface WatchModeInputProps {
  onClose?: () => void;
}

const WatchModeInput: React.FC<WatchModeInputProps> = ({ onClose }) => {
  const [inputAddress, setInputAddress] = useState('');
  const [isValid, setIsValid] = useState(true);
  const navigate = useNavigate();
  const { enableWatchMode } = useWatchMode();

  // Fonction pour valider une adresse Ethereum
  const isValidEthereumAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputAddress.trim()) {
      setIsValid(false);
      return;
    }

    if (!isValidEthereumAddress(inputAddress)) {
      setIsValid(false);
      return;
    }

    // Activer le watch mode et naviguer vers la page avec l'adresse
    enableWatchMode(inputAddress);
    navigate(`/positions/${inputAddress}`);
    
    if (onClose) {
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputAddress(value);
    
    // Réinitialiser la validation si l'utilisateur tape
    if (!isValid && value) {
      setIsValid(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-4">
        <Eye className="w-5 h-5 text-primary-400" />
        <h3 className="text-lg font-medium text-white">
          Watch Mode
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1 text-dark-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      <p className="text-dark-300 text-sm">
        Enter an Hyperliquid address to analyze a portfolio without connecting.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-dark-200">
            Wallet Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={inputAddress}
              onChange={handleInputChange}
              placeholder="0x..."
              className={`w-full px-4 py-3 bg-dark-800 border rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-12 ${
                !isValid ? 'border-red-500' : 'border-dark-700'
              }`}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-primary-400 hover:text-primary-300 transition-colors"
            >
              <Search size={18} />
            </button>
          </div>
          
          {!isValid && (
            <p className="text-red-400 text-xs">
              Please enter a valid Ethereum address (format: 0x...)
            </p>
          )}
          
          {inputAddress && isValidEthereumAddress(inputAddress) && (
            <p className="text-green-400 text-xs flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Valid address
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!inputAddress || !isValidEthereumAddress(inputAddress)}
          className="w-full btn-primary text-black disabled:opacity-50 disabled:cursor-not-allowed font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Analyze this Portfolio
        </button>
      </form>

      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start space-x-2">
          <Eye size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-200">
            <p className="font-medium mb-1">Watch Mode</p>
            <p>
              This mode allows you to analyze any public portfolio without needing to connect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchModeInput;
