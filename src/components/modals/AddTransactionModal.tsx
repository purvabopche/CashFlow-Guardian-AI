import React, { useState } from 'react';
import { X, PlusCircle, ArrowDownLeft, ArrowUpRight, DollarSign, Calendar, Tag, Shield, RefreshCw } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { TransactionCategory } from '../../types/financial';

export const AddTransactionModal: React.FC = () => {
  const { isAddModalOpen, setIsAddModalOpen, addTransaction, addInvoice, addPayment, currency } = useFinancial();
  const [entryType, setEntryType] = useState<'expense' | 'income' | 'invoice'>('expense');

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<TransactionCategory>('Food & Dining');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isDiscretionary, setIsDiscretionary] = useState(true);
  const [merchant, setMerchant] = useState('');

  if (!isAddModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (entryType === 'invoice') {
      addInvoice({
        client: title || 'New Client Account',
        amount: numAmount,
        dueDate: date,
        status: 'pending',
        daysOverdue: 0,
        probabilityOfDelay: 0.2,
        expectedDelayDays: 2,
        description: merchant || 'Milestone Retainer'
      });
    } else {
      addTransaction({
        date,
        title: title || (entryType === 'income' ? 'Client Payout' : `${category} Expense`),
        category,
        type: entryType === 'income' ? 'income' : 'expense',
        amount: numAmount,
        isRecurring,
        isDiscretionary: entryType === 'income' ? false : isDiscretionary,
        merchant: merchant || undefined
      });

      if (isRecurring && entryType === 'expense') {
        addPayment({
          vendor: title || merchant || 'Recurring Vendor',
          amount: numAmount,
          dueDate: date,
          category: 'SaaS',
          isFlexible: isDiscretionary,
          urgency: 'Medium',
          notes: 'Recurring subscription'
        });
      }
    }

    // Reset and close
    setTitle('');
    setAmount('');
    setMerchant('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record Financial Event</h3>
              <p className="text-xs text-slate-500">Inject transactions or invoices into predictive timeline</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Expense vs Income vs Invoice */}
        <div className="mt-5 grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100">
          <button
            type="button"
            onClick={() => {
              setEntryType('expense');
              setCategory('Food & Dining');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              entryType === 'expense'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
            <span>Expense</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEntryType('income');
              setCategory('Income');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              entryType === 'income'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>Direct Income</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEntryType('invoice');
              setCategory('Income');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              entryType === 'invoice'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Future Invoice</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {entryType === 'invoice' ? 'Client Name' : entryType === 'income' ? 'Income Source / Payer' : 'Expense Title'}
            </label>
            <input
              type="text"
              required
              placeholder={entryType === 'invoice' ? 'e.g. Apex Global Corp' : entryType === 'income' ? 'e.g. Freelance Retainer Deposit' : 'e.g. Swiggy Food Delivery / Monitor EMI'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Amount ({currency === 'INR' ? '₹ INR' : '$ USD'})
              </label>
              <input
                type="number"
                required
                min="1"
                step="any"
                placeholder={currency === 'INR' ? '4500' : '150'}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date / Due Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {entryType === 'expense' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Rent & Living">Rent & Living</option>
                    <option value="Utilities">Utilities & WiFi</option>
                    <option value="Subscriptions">Subscriptions & SaaS</option>
                    <option value="Travel & Commute">Travel & Fuel</option>
                    <option value="Shopping">Shopping & Lifestyle</option>
                    <option value="Equipment & Capex">Equipment & Hardware</option>
                    <option value="Payroll & Team">Payroll & Subcontractors</option>
                    <option value="Taxes & Insurance">Taxes & Insurance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Merchant / Platform</label>
                  <input
                    type="text"
                    placeholder="e.g. Swiggy / AWS / Uber"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggles for Recurring & Discretionary */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Recurring Bill / Sub</div>
                    <div className="text-[10px] text-slate-500">Repeats every month</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDiscretionary}
                    onChange={(e) => setIsDiscretionary(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Discretionary Spend</div>
                    <div className="text-[10px] text-slate-500">Non-essential / cuttable</div>
                  </div>
                </label>
              </div>
            </>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition-all"
            >
              Record & Recalculate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
