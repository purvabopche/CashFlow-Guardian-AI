import React, { useState } from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  Receipt,
  TrendingUp,
  AlertTriangle,
  SlidersHorizontal,
  Sparkles,
  Plus,
  Download,
  Building2,
  ChevronDown,
  Menu,
  X,
  Check
} from 'lucide-react';
import { useFinancial, ActivePage } from '../../context/FinancialContext';

export const Navbar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    currentDatasetKey,
    setDatasetKey,
    allDatasets,
    insights,
    summary,
    currency,
    setCurrency,
    formatCurrency,
    setIsAddModalOpen,
    setIsExportModalOpen,
    backendStatus
  } = useFinancial();

  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeInsightsCount = insights.filter((i) => i.status === 'open').length;

  const navItems: { id: ActivePage; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'insights', label: 'AI Insights', icon: Sparkles, badge: activeInsightsCount },
    { id: 'risk', label: 'Risk Analysis', icon: AlertTriangle },
    { id: 'simulator', label: 'What-If Simulator', icon: SlidersHorizontal }
  ];

  const handleNavClick = (pageId: ActivePage) => {
    setActivePage(pageId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      {/* Micro Status Bar */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1 bg-slate-950 text-slate-400 text-xs border-b border-slate-800">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Safety Score:</span>
            <span className="font-semibold text-slate-100 font-mono">{summary.cashHealthScore}/100</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Est. Runway:</span>
            <span className="font-medium text-slate-200 font-mono">~{summary.runwayDays}d</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">30d Horizon:</span>
            <span className={`font-medium font-mono ${summary.projected30DayBalance >= summary.safeBufferThreshold ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(summary.projected30DayBalance)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium font-mono transition-colors ${
                currency === 'INR' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium font-mono transition-colors ${
                currency === 'USD' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              $ USD
            </button>
          </div>

          <span className="text-slate-700">|</span>

          <span className="text-slate-400">
            {backendStatus.connected ? 'FastAPI Port 8000' : 'Client Mode'}
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-emerald-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1">
                  CashFlow <span className="text-emerald-700">Guardian</span>
                  <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-bold text-slate-700 uppercase tracking-wider ml-1 border border-slate-200">
                    AI
                  </span>
                </span>
              </div>
            </button>

            {/* Profile Switcher */}
            <div className="relative ml-2 hidden xl:block">
              <button
                onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50/60 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Building2 className="w-3 h-3 text-slate-400" />
                <span className="max-w-[130px] truncate">{allDatasets[currentDatasetKey]?.name || 'Profile'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isCompanyDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 w-64 rounded-md border border-slate-200 bg-white p-1.5 shadow-lg z-50 animate-fade-in">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Demo Profiles
                  </div>
                  {Object.values(allDatasets).map((ds) => (
                    <button
                      key={ds.id}
                      onClick={() => {
                        setDatasetKey(ds.id);
                        setIsCompanyDropdownOpen(false);
                      }}
                      className={`flex w-full items-start justify-between rounded p-2 text-left text-xs transition-colors ${
                        currentDatasetKey === ds.id ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-900">{ds.name}</div>
                        <div className="text-[11px] text-slate-500">{ds.industry}</div>
                      </div>
                      {currentDatasetKey === ds.id && <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="rounded bg-rose-100 text-rose-700 px-1 py-0.2 text-[10px] font-bold font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              title="Export Briefing"
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Entry</span>
            </button>
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
              className="px-2 py-1 rounded bg-slate-100 text-xs font-mono font-medium text-slate-700"
            >
              {currency === 'INR' ? '₹' : '$'}
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-1.5 rounded bg-emerald-700 text-white"
              title="Add Entry"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded text-slate-700 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 animate-fade-in">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-medium ${
                    isActive ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[10px] font-bold text-rose-800">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <button
              onClick={() => {
                setIsExportModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-md border border-slate-200 py-2 text-xs font-medium text-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Briefing</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
