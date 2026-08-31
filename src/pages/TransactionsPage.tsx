import React, { useState } from 'react';
import {
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Tag,
  Trash2,
  Receipt,
  Download,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { EmptyState } from '../components/common/EmptyState';

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

  const netCashChange = totalIncome - totalExpense;

  const recurringTotal = transactions
    .filter((t) => t.isRecurring && t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const discretionaryTotal = transactions
    .filter((t) => t.isDiscretionary && t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Header & Operations Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/90 font-sans">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Transactions</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-800 font-semibold">{dataset.name}</span>
          </div>
          <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold text-slate-900 tracking-tight mt-1">
            Transactions
          </h1>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto font-sans">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-xs transition-all active:scale-95 btn-interactive"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add transaction</span>
          </button>
        </div>
      </div>

      {/* 2. Institutional Ticker Summary Bar */}
      <div className="fintech-card rounded-xl border border-slate-200/90 p-4 shadow-2xs fintech-card-highlight font-sans">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Total Inflow */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
              Total inflows
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              +{formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-slate-500">Customer payments & receipts</p>
          </div>

          {/* Total Outflow */}
          <div className="space-y-1 pt-3 md:pt-0 md:pl-4">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
              Operating outflows
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              -{formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-slate-500">Rent, payroll & bills</p>
          </div>

          {/* Net Margin */}
          <div className="space-y-1 pt-3 md:pt-0 md:pl-4">
            <span className="text-xs font-semibold text-slate-500">
              Net cash flow
            </span>
            <div
              className={`text-2xl font-bold font-mono tabular-nums ${
                netCashChange >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {netCashChange >= 0 ? '+' : ''}
              {formatCurrency(netCashChange)}
            </div>
            <p className="text-xs text-slate-500">
              {netCashChange >= 0 ? 'Operating surplus' : 'Operating burn'}
            </p>
          </div>

          {/* Recurring Commitments */}
          <div className="space-y-1 pt-3 md:pt-0 md:pl-4">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              Recurring commitments
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatCurrency(recurringTotal)}
            </div>
            <p className="text-xs text-slate-500">
              {Math.round((recurringTotal / Math.max(totalExpense, 1)) * 100)}% of total outflows
            </p>
          </div>

          {/* Discretionary Outlays */}
          <div className="space-y-1 pt-3 md:pt-0 md:pl-4">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              Discretionary spend
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatCurrency(discretionaryTotal)}
            </div>
            <p className="text-xs text-slate-500">
              {Math.round((discretionaryTotal / Math.max(totalExpense, 1)) * 100)}% flexible spend
            </p>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Controls Strip */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-3 font-sans">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions by title, merchant, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* Transaction Type Tabs */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/80 text-xs self-start md:self-auto font-sans">
            {(['all', 'income', 'expense', 'recurring'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-md capitalize font-semibold transition-all ${
                  typeFilter === type
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type === 'all'
                  ? 'All entries'
                  : type === 'income'
                  ? 'Inflows (+)'
                  : type === 'expense'
                  ? 'Outflows (-)'
                  : 'Recurring bills'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-0.5 custom-scrollbar text-xs font-sans">
          <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Professional Operations Ledger Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden font-sans">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <span>
            Showing <strong className="text-slate-900 font-semibold">{filteredTransactions.length}</strong> of{' '}
            <strong className="text-slate-900 font-semibold">{transactions.length}</strong> transactions
          </span>
          <span className="text-xs text-slate-400">Included in 30-day forecast</span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Receipt}
              title="No transactions found"
              description="Try adjusting your search query, category, or type filters."
              actionLabel="Add transaction"
              onAction={() => setIsAddModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-xs uppercase tracking-wider font-semibold text-slate-500">
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Description & vendor</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5 text-right">Amount</th>
                  <th className="py-3.5 px-5 text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-sm">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 transition-colors group text-sm text-slate-800"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-5 font-mono text-xs text-slate-500 whitespace-nowrap align-middle">
                        {tx.date}
                      </td>

                      {/* Description & Counterparty */}
                      <td className="py-3.5 px-5 align-middle">
                        <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5 flex-wrap">
                          <span>{tx.title}</span>
                          {tx.amount >= 20000 && !isIncome && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                              Major outflow
                            </span>
                          )}
                          {tx.amount >= 25000 && isIncome && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Core receipt
                            </span>
                          )}
                        </div>
                        {tx.merchant && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {tx.merchant}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-5 whitespace-nowrap align-middle">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
                          {tx.category}
                        </span>
                      </td>

                      {/* Obligation Type Tags */}
                      <td className="py-3.5 px-5 whitespace-nowrap align-middle">
                        {tx.isRecurring ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/80">
                            <RefreshCw className="w-3 h-3" />
                            Recurring
                          </span>
                        ) : tx.isDiscretionary ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
                            <Tag className="w-3 h-3" />
                            Discretionary
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-sans">Standard</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap align-middle">
                        <span
                          className={`font-mono font-bold text-base tabular-nums ${
                            isIncome ? 'text-emerald-700' : 'text-slate-900'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-center whitespace-nowrap align-middle">
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          title="Remove transaction from ledger"
                          className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors btn-interactive opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
