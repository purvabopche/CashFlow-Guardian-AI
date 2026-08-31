import React from 'react';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ForecastPage } from './pages/ForecastPage';
import { RiskPredictionPage } from './pages/RiskPredictionPage';
import { ScenarioSimulatorPage } from './pages/ScenarioSimulatorPage';
import { AiInsightsPage } from './pages/AiInsightsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { InvoiceFollowUpModal } from './components/modals/InvoiceFollowUpModal';
import { ExportReportModal } from './components/modals/ExportReportModal';
import { CreatePaymentModal } from './components/modals/CreatePaymentModal';
import { PaymentImpactModal } from './components/modals/PaymentImpactModal';
import { CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activePage, toastMessage } = useFinancial();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Bar with Currency & Preset Switchers */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activePage === 'dashboard' && <DashboardPage />}
        {activePage === 'transactions' && <TransactionsPage />}
        {activePage === 'payments' && <PaymentsPage />}
        {activePage === 'forecast' && <ForecastPage />}
        {activePage === 'insights' && <AiInsightsPage />}
        {activePage === 'risk' && <RiskPredictionPage />}
        {activePage === 'simulator' && <ScenarioSimulatorPage />}
      </main>

      {/* Global Fintech Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-slate-950 text-white px-4 py-3 shadow-2xl border border-slate-800 animate-slide-up text-xs font-mono font-medium backdrop-blur-md max-w-md">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/80">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 text-slate-200 leading-snug">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddTransactionModal />
      <InvoiceFollowUpModal />
      <ExportReportModal />
      <CreatePaymentModal />
      <PaymentImpactModal />


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
