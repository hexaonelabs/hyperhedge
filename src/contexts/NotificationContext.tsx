import React, { createContext, useState, ReactNode } from "react";

interface OrderStatus {
  oid: string;
  filled: boolean;
  type: "spot" | "perp";
}

interface NotificationState {
  isVisible: boolean;
  status: "loading" | "success" | "error" | "notify";
  message?: string;
  orders?: OrderStatus[];
}

interface NotificationContextType {
  notification: NotificationState;
  showLoading: (message?: string) => void;
  showSuccess: (orders?: OrderStatus[], message?: string) => void;
  showError: (message: string) => void;
  showNotify: (message: string) => void;
  hide: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notification, setNotification] = useState<NotificationState>({
    isVisible: false,
    status: "loading",
  });

  const showLoading = (message?: string) => {
    setNotification({
      isVisible: true,
      status: "loading",
      message,
    });
  };

  const showSuccess = (orders?: OrderStatus[], message?: string) => {
    setNotification({
      isVisible: true,
      status: "success",
      orders,
      message,
    });
  };

  const showError = (message: string) => {
    setNotification({
      isVisible: true,
      status: "error",
      message,
    });
  };

  const showNotify = (message: string) => {
    setNotification({
      isVisible: true,
      status: "notify",
      message,
    });
  }

  const hide = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const value: NotificationContextType = {
    notification,
    showLoading,
    showSuccess,
    showError,
    showNotify,
    hide,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext };
