import React, { useState } from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
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
  Home,
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
    setIsAddModalOpen,
    setIsExportModalOpen,
    backendStatus
  } = useFinancial();

  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeInsightsCount = insights.filter((i) => i.status === 'open').length;

  const navItems: { id: ActivePage; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'risk', label: 'Risk Prediction', icon: AlertTriangle },
    { id: 'simulator', label: 'Scenario Simulator', icon: SlidersHorizontal },
    { id: 'insights', label: 'AI Insights', icon: Sparkles, badge: activeInsightsCount }
  ];

  const handleNavClick = (pageId: ActivePage) => {
    setActivePage(pageId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      {/* Top micro bar for quick business stats */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1.5 bg-slate-900 text-slate-300 text-xs font-medium border-b border-slate-800">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Cash Health Score:</span>
            <span className="font-bold text-white">{summary.cashHealthScore}/100</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Runway:</span>
            <span className="font-semibold text-emerald-400">{summary.runwayDays} Days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">30-Day Outlook:</span>
            <span className={`font-semibold ${summary.projected30DayBalance >= summary.safeBufferThreshold ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${summary.projected30DayBalance.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className={`h-1.5 w-1.5 rounded-full ${backendStatus.connected ? 'bg-emerald-400' : 'bg-blue-400'}`} />
            <span>{backendStatus.connected ? 'FastAPI Connected (Port 8000)' : 'Client Simulation Engine (Active)'}</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Bank Feeds: <strong className="text-slate-200">Connected (Plaid Mock)</strong></span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('landing')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 via-fintech-navy to-emerald-700 text-emerald-400 shadow-md group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1">
                  CashFlow <span className="text-emerald-600 font-extrabold">Guardian</span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider ml-1">
                    AI
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 block -mt-0.5">Early Shortage Risk Intelligence</span>
              </div>
            </button>

            {/* Business Profile Switcher */}
            <div className="relative ml-2 hidden xl:block">
              <button
                onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="max-w-[140px] truncate">{allDatasets[currentDatasetKey]?.name || 'Select Profile'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isCompanyDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-fade-in">
                  <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Demo Business Preset
                  </div>
                  {Object.values(allDatasets).map((ds) => (
                    <button
                      key={ds.id}
                      onClick={() => {
                        setDatasetKey(ds.id);
                        setIsCompanyDropdownOpen(false);
                      }}
                      className={`flex w-full items-start justify-between rounded-lg p-2 text-left text-xs transition-colors ${
                        currentDatasetKey === ds.id ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-900">{ds.name}</div>
                        <div className="text-[11px] text-slate-500">{ds.industry}</div>
                      </div>
                      {currentDatasetKey === ds.id && <Check className="w-4 h-4 text-emerald-600 mt-0.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                        isActive ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                      }`}
                    >
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
              title="Export Financial Forecast & Analysis"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:shadow hover:shadow-emerald-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Entry</span>
            </button>
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-2 rounded-lg bg-emerald-600 text-white"
              title="Add Entry"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 animate-fade-in shadow-xl">
          {/* Preset switch in mobile */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <div className="text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Business Profile</div>
            <div className="grid grid-cols-1 gap-1">
              {Object.values(allDatasets).map((ds) => (
                <button
                  key={ds.id}
                  onClick={() => setDatasetKey(ds.id)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs text-left ${
                    currentDatasetKey === ds.id ? 'bg-emerald-600 text-white font-semibold' : 'bg-white text-slate-700'
                  }`}
                >
                  <span>{ds.name}</span>
                  {currentDatasetKey === ds.id && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
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
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
