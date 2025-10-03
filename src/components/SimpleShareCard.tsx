import React, { useRef, useState } from "react";
import { Download, Copy, Check, TrendingUp, TrendingDown } from "lucide-react";
import { generateSimpleShareImage, downloadImage } from "../utils/simpleImageGeneration";

interface SimpleShareCardProps {
  apy: number;
  userAddress?: string;
}

export const SimpleShareCard: React.FC<SimpleShareCardProps> = ({
  apy,
  userAddress,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      const dataUrl = await generateSimpleShareImage(cardRef.current);
      if (dataUrl) {
        downloadImage(dataUrl, `hyperhedge-apy-${Date.now()}.png`);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareToSocial = async (platform: 'twitter' | 'linkedin' | 'copy') => {
    const text = `🚀 Mon APY sur HyperHedge: ${apy >= 0 ? '+' : ''}${apy.toFixed(2)}%\n\n#DeFi #HyperHedge #CryptoTrading`;
    
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(text + '\n\nhttps://hyperhedge.app');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
      return;
    }

    const url = 'https://hyperhedge.app';
    const encodedText = encodeURIComponent(text);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodeURIComponent(url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="space-y-6">
      {/* Carte Simple - Ajustement pour éviter la troncature */}
      <div 
        ref={cardRef}
        className="mx-auto bg-gradient-to-br from-gray-900 to-black border border-primary-400/30 rounded-xl relative overflow-hidden"
        style={{ 
          width: '400px', 
          height: '320px',
          padding: '20px',
          boxSizing: 'border-box',
          display: 'block',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-l font-bold text-white">HyperHedge</h1>
            <p className="text-primary-400 text-xs">Performance Report</p>
          </div>
          {userAddress && (
            <p className="text-gray-400 text-xs">{formatAddress(userAddress)}</p>
          )}
        </div>

        {/* APY Principal */}
        <div className="text-center mb-6">
          <p className="text-gray-400 text-xs mb-2">Annual Percentage Yield</p>
          <p className={`text-4xl font-bold ${apy >= 0 ? 'text-primary-400' : 'text-red-400'}`}>
            {apy >= 0 ? '+' : ''}{apy.toFixed(1)}%
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-gray-400 text-xs">Powered by</p>
            <p className="text-primary-400 font-semibold text-sm">HyperHedge</p>
          </div>
          <div className="text-right">
            <p className="text-white text-sm">hyperhedge.web.app</p>
            <p className="text-gray-400 text-xs">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Icône de tendance en arrière-plan */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {apy >= 0 ? (
            <TrendingUp className={`w-full h-full opacity-10 ${apy >= 0 ? 'text-primary-400' : 'text-red-400'}`} />
          ) : (
            <TrendingDown className={`w-full h-full opacity-10 ${apy >= 0 ? 'text-primary-400' : 'text-red-400'}`} />
          )}
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={downloadCard}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-black rounded-lg font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          {isGenerating ? 'Waiting...' : 'Download'}
        </button>

        <button
          onClick={() => shareToSocial('twitter')}
          className="flex items-center gap-2 px-4 py-2 bg-dark-600 hover:bg-dark-700 text-white rounded-lg font-medium transition-colors"
        >
          {/* <X className="w-4 h-4" /> */}
          share on X
        </button>

        <button
          onClick={() => shareToSocial('copy')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copié!' : 'Copier'}
        </button>
      </div>
    </div>
  );
};

export default SimpleShareCard;