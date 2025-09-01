import React from "react";

const StatsWidget: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-dark-900 to-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary-400 mb-2">
              $2.1M+
            </div>
            <div className="text-dark-300">Total Value Locked</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-success-400 mb-2">
              12.4%
            </div>
            <div className="text-dark-300">Average APY</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-warning-400 mb-2">847</div>
            <div className="text-dark-300">Active Positions</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">99.9%</div>
            <div className="text-dark-300">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsWidget;
