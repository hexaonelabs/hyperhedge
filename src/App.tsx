import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import NotificationToast from "./components/NotificationToast";
import useToggle from "./hooks/useToggle";
import { useNotification } from "./hooks/useNotification";
import HomePage from "./pages/HomePage";
import MarketsPage from "./pages/MarketsPage";
import PositionsPage from "./pages/PositionsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DocsPage from "./pages/DocsPage";
import RiskManagementPage from "./pages/RiskManagementPage";
import { useWallet } from "./hooks/useWallet";
import { useHyperliquidConfig } from "./hooks/useHyperliquidConfig";

function App() {
  const { value: isMenuOpen, toggle: toggleMenu } = useToggle(false);
  const { notification, hide: hideNotification } = useNotification();
  const { address, isConnected } = useWallet();
  const {
    isLoading,
    hasConfig,
    isConfigured,
    loadConfig,
  } = useHyperliquidConfig();

  useEffect(() => {
    console.log("Wallet status changed:", { address, isConnected });
    if (isConnected && !isLoading && hasConfig && !isConfigured) {
      // Fetch user data or perform actions when connected
      loadConfig();
    } else {
      // Handle disconnection
      // clearConfig();
    }
  }, [address, isConnected, isLoading, hasConfig, isConfigured, loadConfig]);

  return (
    <div className="min-h-screen bg-dark-950">
      <ScrollToTop />
      <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/markets" element={<MarketsPage />} />
          <Route path="/positions" element={<PositionsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/risk-management" element={<RiskManagementPage />} />
        </Routes>
      </main>

      <Footer />

      {/* Notification globale */}
      <NotificationToast
        isVisible={notification.isVisible}
        status={notification.status}
        message={notification.message}
        orders={notification.orders}
        onClose={hideNotification}
      />
    </div>
  );
}

export default App;
