import React from "react";
import {
  TrendingUp,
  Shield,
  DollarSign,
  BarChart3,
  Zap,
  Target,
} from "lucide-react";
import Card from "../components/Card";

const FeaturesWidget: React.FC = () => {
  const features = [
    {
      id: "1",
      title: "Automated Hedging",
      description:
        "Create delta-neutral positions automatically. Our software create for you the perfect optimized delta-neutral position using Hyperliquid spot and perpetual markets.",
      icon: <Target size={24} className="text-black" />,
      variant: "default" as const,
    },
    {
      id: "2",
      title: "Funding Rate Capture",
      description:
        "Systematically capture funding rate premiums. Earn consistent yields from the natural imbalances in perpetual futures markets.",
      icon: <DollarSign size={24} className="text-black" />,
      variant: "default" as const,
    },
    {
      id: "3",
      title: "Risk Management",
      description:
        `Adjustable risk parameters and automated position sizing. Protect your capital with advanced risk management tools.`,
      icon: <Shield size={24} className="text-black" />,
      variant: "default" as const,
    },
    {
      id: "4",
      title: "Real-time Analytics",
      description:
        "Comprehensive dashboard with live P&L tracking, funding rate history, and performance metrics for all your positions.",
      icon: <BarChart3 size={24} className="text-black" />,
      variant: "default" as const,
    },
    {
      id: "5",
      title: "Fees Optimized",
      description: `Minimized trading and funding fees through Hyperliquid advanced fee structure.`,
      icon: <Zap size={24} className="text-black" />,
      variant: "default" as const,
    },
    {
      id: "6",
      title: "Hyperliquid Native",
      description:
        "Built specifically for Hyperliquid infrastructure. Take advantage of the platform's unique features and deep liquidity.",
      icon: <TrendingUp size={24} className="text-black" />,
      variant: "default" as const,
    },
  ];

  return (
    <section className="py-16 bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
            Advanced Features
          </h2>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Professional-grade tools for sophisticated funding rate arbitrage
            strategies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              variant={feature.variant}
              onClick={() => console.log(`Clicked on ${feature.title}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesWidget;
