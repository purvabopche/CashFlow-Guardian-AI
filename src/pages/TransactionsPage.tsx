import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Tag,
  Trash2
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
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
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Transaction Ledger
            </h1>
            <span className="text-xs font-mono text-slate-400">
              • {transactions.length} entries
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational cash ledger with automated categorization and discretionary tagging.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="Recorded Income"
          value={formatCurrency(totalIncome)}
          subValue="Retainers & deposits"
          icon={ArrowDownLeft}
        />

        <MetricCard
          title="Recorded Outflows"
          value={formatCurrency(totalExpense)}
          subValue="Operating burn & bills"
          icon={ArrowUpRight}
        />

        <MetricCard
          title="Recurring Subscriptions"
          value={formatCurrency(recurringTotal)}
          subValue={`${Math.round((recurringTotal / Math.max(totalExpense, 1)) * 100)}% of outflow`}
          icon={RefreshCw}
        />

        <MetricCard
          title="Discretionary Spend"
          value={formatCurrency(discretionaryTotal)}
          subValue={`${Math.round((discretionaryTotal / Math.max(totalExpense, 1)) * 100)}% elastic spend`}
          icon={Tag}
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md w-full md:w-auto">
            {(['all', 'income', 'expense', 'recurring'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-all ${
                  typeFilter === t
                    ? 'bg-white text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'recurring' ? 'Recurring' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium text-[11px] mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Nature</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-600">{tx.date}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-900">{tx.title}</div>
                      {tx.merchant && <div className="text-[10px] text-slate-400">{tx.merchant}</div>}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-700">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        {tx.isRecurring && (
                          <span className="rounded bg-purple-50 px-1.5 py-0.2 text-[10px] font-medium text-purple-700 border border-purple-200">
                            Recurring
                          </span>
                        )}
                        {tx.isDiscretionary && (
                          <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[10px] font-medium text-amber-700 border border-amber-200">
                            Discretionary
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-xs">
                      <span className={tx.type === 'income' ? 'text-emerald-700' : 'text-slate-900'}>
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
