import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Tag,
  Trash2,
  PieChart as PieIcon,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { TransactionCategory } from '../types/financial';
import { MetricCard } from '../components/common/MetricCard';

export const TransactionsPage: React.FC = () => {
  const { dataset, formatCurrency, deleteTransaction, setIsAddModalOpen } = useFinancial();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'recurring'>('all');

  const categories = [
    'All',
    'Income',
    'Rent & Living',
    'Utilities',
    'Subscriptions',
    'Food & Dining',
    'Groceries',
    'Equipment & Capex',
    'Travel & Commute',
    'Shopping'
  ];

  const transactions = dataset.transactions || [];

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.merchant && t.merchant.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;

    const matchesType =
      typeFilter === 'all'
        ? true
        : typeFilter === 'recurring'
        ? t.isRecurring
        : t.type === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const recurringTotal = transactions
    .filter((t) => t.isRecurring && t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const discretionaryTotal = transactions
    .filter((t) => t.isDiscretionary && t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Financial Transactions
            </h1>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
              {transactions.length} Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Historical income entries, fixed recurring bills, and discretionary spending streams.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Recorded Income"
          value={formatCurrency(totalIncome)}
          subValue="Client retainers & payouts"
          icon={ArrowDownLeft}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />

        <MetricCard
          title="Total Recorded Outflows"
          value={formatCurrency(totalExpense)}
          subValue="Operating expenses & bills"
          icon={ArrowUpRight}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
        />

        <MetricCard
          title="Fixed Recurring Total"
          value={formatCurrency(recurringTotal)}
          subValue={`${Math.round((recurringTotal / Math.max(totalExpense, 1)) * 100)}% of total outflows`}
          icon={RefreshCw}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />

        <MetricCard
          title="Discretionary Spend"
          value={formatCurrency(discretionaryTotal)}
          subValue={`${Math.round((discretionaryTotal / Math.max(totalExpense, 1)) * 100)}% elastic budget`}
          icon={Tag}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, category, merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            {(['all', 'income', 'expense', 'recurring'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'recurring' ? 'Recurring Subscriptions' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Recorded Transactions Ledger</h3>
          <span className="text-xs text-slate-500 font-mono">
            Showing {filteredTransactions.length} of {transactions.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase text-[11px]">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Transaction Description</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Nature</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No transactions match your current search or filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-slate-900 font-mono">{tx.date}</td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{tx.title}</div>
                      {tx.merchant && <div className="text-[11px] text-slate-400">{tx.merchant}</div>}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {tx.isRecurring && (
                          <span className="rounded bg-purple-50 px-1.5 py-0.2 text-[10px] font-bold text-purple-700 border border-purple-200">
                            Recurring
                          </span>
                        )}
                        {tx.isDiscretionary && (
                          <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[10px] font-bold text-amber-700 border border-amber-200">
                            Discretionary
                          </span>
                        )}
                        {!tx.isRecurring && !tx.isDiscretionary && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-500">
                            Fixed / Essential
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-sm">
                      <span className={tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}>
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
