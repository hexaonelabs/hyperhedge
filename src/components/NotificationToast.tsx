import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  X,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface OrderStatus {
  oid: string;
  filled: boolean;
  type: "spot" | "perp";
}

interface NotificationToastProps {
  isVisible: boolean;
  status: "loading" | "success" | "error";
  message?: string;
  orders?: OrderStatus[];
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  isVisible,
  status,
  message,
  orders,
  onClose,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === "loading") {
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 2 : prev));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [status]);

  if (!isVisible) return null;

  const getStatusConfig = () => {
    switch (status) {
      case "loading":
        return {
          icon: <Clock className="animate-spin" size={20} />,
          bgClass: "from-blue-600/20 to-primary-600/20 border-blue-500/30",
          iconClass: "text-blue-400",
          title: "Creating Hedge Position...",
          description: "Please wait while we process your hedge strategy",
        };
      case "success":
        return {
          icon: <CheckCircle size={20} />,
          bgClass: "from-success-600/20 to-green-600/20 border-success-500/30",
          iconClass: "text-success-400",
          title: "Hedge Position Created!",
          description: "Your hedge strategy has been successfully executed",
        };
      case "error":
        return {
          icon: <XCircle size={20} />,
          bgClass: "from-red-600/20 to-red-700/20 border-red-500/30",
          iconClass: "text-red-400",
          title: "Failed to Create Position",
          description:
            message || "An error occurred while creating your hedge position",
        };
      default:
        return {
          icon: <Clock size={20} />,
          bgClass: "from-dark-600/20 to-dark-700/20 border-dark-500/30",
          iconClass: "text-dark-400",
          title: "Processing...",
          description: "",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="fixed top-4 left-4 right-4 sm:top-4 sm:right-4 sm:left-auto z-[60] sm:max-w-md">
      <div
        className={`bg-gradient-to-r ${
          config.bgClass
        } backdrop-blur-sm border rounded-xl p-4 shadow-2xl transform transition-all duration-300 ${
          isVisible
            ? "translate-y-0 sm:translate-x-0 opacity-100"
            : "-translate-y-full sm:translate-y-0 sm:translate-x-full opacity-0"
        } w-full sm:w-auto`}
      >
        {/* Progress bar pour loading */}
        {status === "loading" && (
          <div
            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-primary-500 rounded-t-xl transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`p-2 rounded-lg bg-dark-800/50 ${config.iconClass} flex-shrink-0`}
            >
              {config.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-semibold text-sm truncate">
                {config.title}
              </h3>
              <p className="text-dark-300 text-xs mt-0.5 break-words">
                {config.description}
              </p>
            </div>
          </div>
          {status !== "loading" && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-dark-700/50 rounded-lg transition-colors text-dark-400 hover:text-white flex-shrink-0 ml-2"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Orders Status (pour success) */}
        {status === "success" && orders && orders.length > 0 && (
          <div className="space-y-2 mt-3">
            <div className="text-xs text-dark-300 font-medium">
              Order Status:
            </div>
            {orders.map((order) => (
              <div
                key={order.oid}
                className="flex items-center justify-between p-2 bg-dark-800/30 rounded-lg gap-2"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {order.type === "spot" ? (
                    <TrendingUp
                      className="text-success-400 flex-shrink-0"
                      size={14}
                    />
                  ) : (
                    <TrendingDown
                      className="text-red-400 flex-shrink-0"
                      size={14}
                    />
                  )}
                  <span className="text-xs text-white font-medium truncate">
                    {order.type === "spot" ? "Spot Buy" : "Perp Short"}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                      order.filled
                        ? "bg-success-500/20 text-success-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {order.filled ? "Filled" : "Pending"}
                  </span>
                  <span className="text-xs text-dark-400 font-mono hidden sm:inline">
                    #{order.oid.toString().slice(0, 6)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading steps */}
        {status === "loading" && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-dark-300">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="break-words">Signing transaction...</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-dark-300">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75 flex-shrink-0"></div>
              <span className="break-words">
                Creating spot and perpetual orders...
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-dark-300">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150 flex-shrink-0"></div>
              <span className="break-words">Executing hedge strategy...</span>
            </div>
          </div>
        )}

        {/* Instruction pour fermer (uniquement pour success et error) */}
        {status !== "loading" && (
          <div className="mt-3 pt-2 border-t border-dark-700/50">
            <p className="text-xs text-dark-400 text-center">
              Click the × button to close this notification
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationToast;
