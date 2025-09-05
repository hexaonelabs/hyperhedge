import React from "react";
import { TrendingUp, Github } from "lucide-react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-950 border-t border-dark-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary-400 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp size={20} className="text-black" />
              </div>
              <h3 className="text-lg font-semibold text-white">HyperHedge</h3>
            </div>
            <p className="text-dark-300 mb-4 max-w-md">
              Automated funding rate arbitrage on Hyperliquid. Create
              market-neutral positions and earn passive income through
              systematic capture of funding fee premiums.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/hexaonelabs"
                className="text-dark-400 hover:text-primary-400 transition-colors"
              >
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/markets"
                  className="text-dark-300 hover:text-primary-400 transition-colors"
                >
                  Market
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-dark-300 hover:text-primary-400 transition-colors"
                >
                  Create Position
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-dark-300 hover:text-primary-400 transition-colors"
                >
                  Analytics
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-dark-300 hover:text-primary-400 transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-dark-300 hover:text-primary-400 transition-colors"
                >
                  Tutorials
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-dark-300 hover:text-primary-400 transition-colors"
                >
                  Risk Management
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-dark-300 hover:text-primary-400 transition-colors"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-dark-800 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-dark-400 text-sm">
            © 2025 HyperHedge. Built on Hyperliquid Protocol.
          </p>
          <div className="flex items-center text-dark-400 text-sm mt-4 sm:mt-0">
            <span className="mr-2">Powered by</span>
            <span className="text-primary-400 font-medium">Hyperliquid</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
