import React, { useState } from 'react';
import { X, PlusCircle, ArrowDownLeft, ArrowUpRight, Calendar } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 font-sans">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Add transaction</h3>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-3.5 grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-slate-100 text-xs font-sans">
          <button
            type="button"
            onClick={() => {
              setEntryType('expense');
              setCategory('Food & Dining');
            }}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-md font-semibold transition-all ${
              entryType === 'expense'
                ? 'bg-white text-rose-700 shadow-2xs'
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
            className={`flex items-center justify-center gap-1 py-1.5 rounded-md font-semibold transition-all ${
              entryType === 'income'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>Income</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEntryType('invoice');
              setCategory('Income');
            }}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-md font-semibold transition-all ${
              entryType === 'invoice'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <span>Invoice</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs font-sans">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {entryType === 'invoice' ? 'Client name *' : entryType === 'income' ? 'Income source *' : 'Description *'}
            </label>
            <input
              type="text"
              required
              placeholder={entryType === 'invoice' ? 'e.g. Apex Global Logistics' : entryType === 'income' ? 'e.g. Client Retainer Deposit' : 'e.g. Swiggy Food Delivery / SaaS Stack'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount ({currency === 'INR' ? '₹ INR' : '$ USD'}) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="any"
                placeholder="4500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date / due date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none font-mono"
              />
            </div>
          </div>

          {entryType === 'expense' && (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none bg-white"
                  >
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Rent & Living">Rent & Living</option>
                    <option value="Utilities">Utilities & WiFi</option>
                    <option value="Subscriptions">Subscriptions & SaaS</option>
                    <option value="Travel & Commute">Travel & Fuel</option>
                    <option value="Shopping">Shopping & Lifestyle</option>
                    <option value="Equipment & Capex">Equipment & Hardware</option>
                    <option value="Payroll & Team">Payroll & Team</option>
                    <option value="Taxes & Insurance">Taxes & Insurance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Merchant (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. AWS / Uber"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded text-slate-900 focus:ring-slate-400 h-4 w-4"
                  />
                  <span className="text-slate-700 font-semibold">Recurring bill</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={isDiscretionary}
                    onChange={(e) => setIsDiscretionary(e.target.checked)}
                    className="rounded text-slate-900 focus:ring-slate-400 h-4 w-4"
                  />
                  <span className="text-slate-700 font-semibold">Discretionary</span>
                </label>
              </div>
            </>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 font-sans">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-700 hover:bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-xs btn-interactive"
            >
              Save transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
