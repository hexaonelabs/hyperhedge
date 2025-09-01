import React from "react";
import { TrendingUp } from "lucide-react";

const CtaWidget: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-primary-900/20 to-primary-800/20 py-16 border-y border-primary-800/30">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Start Earning?
        </h2>
        <p className="text-xl text-dark-300 mb-8">
          Join hundreds of traders already earning passive income through
          automated funding rate arbitrage on Hyperliquid.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-black text-lg font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg hover:shadow-xl">
            Launch App
            <TrendingUp size={20} className="ml-2" />
          </button>
          <button className="inline-flex items-center px-8 py-4 border-2 border-dark-600 text-lg font-medium rounded-lg text-dark-200 bg-dark-800/50 hover:bg-dark-700/50 hover:border-dark-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-500 transition-all duration-200">
            Read Whitepaper
          </button>
        </div>
      </div>
    </section>
  );
};

export default CtaWidget;
