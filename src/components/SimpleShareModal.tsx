import React from "react";
import { X } from "lucide-react";
import SimpleShareCard from "./SimpleShareCard";

interface SimpleShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  apy: number;
  userAddress?: string;
}

export const SimpleShareModal: React.FC<SimpleShareModalProps> = ({
  isOpen,
  onClose,
  apy,
  userAddress,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Share your Performance</h2>
            <p className="text-gray-400 text-sm mt-1">
              Share your APY on social media
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <SimpleShareCard
            apy={apy}
            userAddress={userAddress}
          />
        </div>
      </div>
    </div>
  );
};

export default SimpleShareModal;