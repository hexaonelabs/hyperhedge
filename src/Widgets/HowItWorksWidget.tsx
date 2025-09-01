import React from "react";

const HowItWorksWidget: React.FC = () => {
  return (
    <section className="py-16 bg-dark-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
            How HyperHedge Works
          </h2>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Simple three-step process to start earning passive income from
            funding rate arbitrage
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-black text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Connect & Deposit
            </h3>
            <p className="text-dark-300">
              Connect your wallet and setup API keys to start creating hedge
              positions on Hyperliquid.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-black text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Select Strategy
            </h3>
            <p className="text-dark-300">
              Choose your preferred assets and risk parameters. Our algorithm
              creates optimal hedge ratios.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-black text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Earn Passively
            </h3>
            <p className="text-dark-300">
              Sit back and earn funding fees automatically. Monitor your returns
              in real-time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksWidget;
