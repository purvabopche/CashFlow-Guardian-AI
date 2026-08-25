import React from 'react';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ForecastPage } from './pages/ForecastPage';
import { RiskPredictionPage } from './pages/RiskPredictionPage';
import { ScenarioSimulatorPage } from './pages/ScenarioSimulatorPage';
import { AiInsightsPage } from './pages/AiInsightsPage';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { InvoiceFollowUpModal } from './components/modals/InvoiceFollowUpModal';
import { ExportReportModal } from './components/modals/ExportReportModal';
import { CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activePage, toastMessage } = useFinancial();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activePage === 'landing' && <LandingPage />}
        {activePage === 'dashboard' && <DashboardPage />}
        {activePage === 'forecast' && <ForecastPage />}
        {activePage === 'risk' && <RiskPredictionPage />}
        {activePage === 'simulator' && <ScenarioSimulatorPage />}
        {activePage === 'insights' && <AiInsightsPage />}
      </main>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-3 shadow-2xl border border-slate-700 animate-slide-up text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <AddTransactionModal />
      <InvoiceFollowUpModal />
      <ExportReportModal />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <FinancialProvider>
      <AppContent />
    </FinancialProvider>
  );
}

export default App;
