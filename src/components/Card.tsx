import React from "react";

interface CardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "default" | "success" | "warning" | "danger";
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  icon,
  className = "",
  onClick,
  variant = "default",
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "hover:border-success-700/50 hover:bg-success-950/20";
      case "warning":
        return "hover:border-warning-700/50 hover:bg-warning-950/20";
      case "danger":
        return "hover:border-danger-700/50 hover:bg-danger-950/20";
      default:
        return "hover:border-primary-700/50 hover:bg-primary-950/20";
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case "success":
        return "from-success-500 to-success-700";
      case "warning":
        return "from-warning-500 to-warning-700";
      case "danger":
        return "from-danger-500 to-danger-700";
      default:
        return "from-primary-500 to-primary-700";
    }
  };

  return (
    <div
      className={`card ${getVariantClasses()} cursor-pointer group ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center mb-4">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${getIconBg()} rounded-lg flex items-center justify-center text-white mr-4 group-hover:scale-110 transition-transform duration-200`}
        >
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      <p className="text-dark-300 leading-relaxed">{description}</p>
    </div>
  );
};

export default Card;
