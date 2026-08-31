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
  Check,
  CreditCard
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
    backendStatus,
    payments
  } = useFinancial();

  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeInsightsCount = insights.filter((i) => i.status === 'open').length;
  const pendingPaymentsCount = (payments || []).filter((p) => p.status === 'pending').length;

  const navItems: { id: ActivePage; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'payments', label: 'Payments', icon: CreditCard, badge: pendingPaymentsCount },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'insights', label: 'Actions', icon: Sparkles, badge: activeInsightsCount },
    { id: 'risk', label: 'Risk Analysis', icon: AlertTriangle },
    { id: 'simulator', label: 'Simulator', icon: SlidersHorizontal }
  ];


  const handleNavClick = (pageId: ActivePage) => {
    setActivePage(pageId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      {/* Micro Status Bar / Financial Ticker */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1.5 bg-slate-950 text-slate-400 text-xs border-b border-slate-800/90 font-sans">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 text-xs font-normal">Safety score:</span>
            <span className="font-bold text-slate-100 font-mono text-xs tabular-nums">{summary.cashHealthScore}/100</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-normal">Runway:</span>
            <span className="font-semibold text-slate-200 font-mono text-xs tabular-nums">~{summary.runwayDays} days</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-normal">30-day forecast:</span>
            <span className={`font-bold font-mono text-xs tabular-nums ${summary.projected30DayBalance >= summary.safeBufferThreshold ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(summary.projected30DayBalance)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-sans">
          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-2 py-0.5 rounded text-xs font-semibold font-mono transition-all ${
                currency === 'INR' ? 'bg-slate-800 text-emerald-400 shadow-2xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2 py-0.5 rounded text-xs font-semibold font-mono transition-all ${
                currency === 'USD' ? 'bg-slate-800 text-emerald-400 shadow-2xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              $ USD
            </button>
          </div>

          <span className="text-slate-800">|</span>

          <span className="flex items-center gap-1.5 text-slate-300 font-sans text-xs">
            <span className={`h-1.5 w-1.5 rounded-full ${backendStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400/80'}`} />
            <span>{backendStatus.connected ? 'Live Sync' : 'Offline / Local Data'}</span>
          </span>

          <span className="text-slate-800">|</span>

          <button
            onClick={() => {
              localStorage.removeItem('cf_guardian_onboarding_dismissed');
              window.location.reload();
            }}
            className="flex items-center gap-1 text-xs font-sans text-slate-400 hover:text-emerald-400 transition-colors"
            title="Replay Hackathon Guided Tour"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tour Guide</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo & Brand with Bespoke CG Guardian Monogram */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none select-none btn-interactive"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-emerald-400 border border-slate-800 shadow-2xs group-hover:border-emerald-500/40 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2L4 5.5V11.5C4 16.5 7.5 21 12 22C16.5 21 20 16.5 20 11.5V5.5L12 2Z"
                    stroke="#10B981"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.5 13.5C8.5 11 10.5 9 13 9H15.5M15.5 9L13.5 7M15.5 9L13.5 11"
                    stroke="#F8FAFC"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="13" r="1.2" fill="#10B981" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1">
                  CashFlow <span className="text-emerald-700 font-extrabold">Guardian</span>
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 ml-1 border border-emerald-200/80">
                    AI
                  </span>
                </span>
              </div>
            </button>

            {/* Profile Switcher */}
            <div className="relative ml-2 hidden xl:block">
              <button
                onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50/60 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="max-w-[130px] truncate">{allDatasets[currentDatasetKey]?.name || 'Profile'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isCompanyDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 w-64 rounded-md border border-slate-200 bg-white p-1.5 shadow-lg z-50 animate-fade-in font-sans">
                  <div className="px-2 py-1 text-xs font-semibold text-slate-500">
                    Sample business profiles
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
                        <div className="font-medium text-slate-900 text-sm">{ds.name}</div>
                        <div className="text-xs text-slate-500">{ds.industry}</div>
                      </div>
                      {currentDatasetKey === ds.id && <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Tabs - 14px, medium */}
          <nav className="hidden lg:flex items-center gap-1 font-sans">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`h-9 inline-flex items-center gap-2 px-3 text-sm transition-all font-medium rounded-lg btn-interactive select-none ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`inline-flex items-center justify-center h-4 min-w-4 px-1.5 rounded-full text-[11px] font-bold font-mono leading-none ${
                        isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-800'
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
          <div className="hidden sm:flex items-center gap-2 font-sans">
            <button
              onClick={() => setIsExportModalOpen(true)}
              title="Export Briefing"
              className="h-9 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs btn-interactive"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="h-9 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 px-3.5 text-xs font-semibold text-white shadow-2xs transition-all active:scale-95 btn-interactive"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Record Entry</span>
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
        <div className="lg:hidden border-t border-slate-200/90 bg-white px-4 pt-3 pb-5 space-y-3 animate-fade-in shadow-xl">
          {/* Mobile Profile Switcher */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-sans">
            <span className="text-xs font-semibold text-slate-500 block mb-1.5">
              Active business profile
            </span>
            <div className="grid grid-cols-1 gap-1">
              {Object.values(allDatasets).map((ds) => (
                <button
                  key={ds.id}
                  onClick={() => {
                    setDatasetKey(ds.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors ${
                    currentDatasetKey === ds.id
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <div className="text-left font-sans">
                    <div className="text-sm font-medium">{ds.name}</div>
                    <div className={`text-xs ${currentDatasetKey === ds.id ? 'text-slate-300' : 'text-slate-500'}`}>
                      {ds.industry}
                    </div>
                  </div>
                  {currentDatasetKey === ds.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 font-sans">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium btn-interactive ${
                    isActive ? 'bg-slate-900 text-white font-semibold shadow-2xs' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold font-mono ${
                      isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 font-sans">
            <button
              onClick={() => {
                setIsExportModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 btn-interactive"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export report</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
