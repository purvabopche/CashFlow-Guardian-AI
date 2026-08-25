import React, { useState } from 'react';
import { X, PlusCircle, ArrowDownLeft, ArrowUpRight, DollarSign, Calendar, Tag, Shield } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const AddTransactionModal: React.FC = () => {
  const { isAddModalOpen, setIsAddModalOpen, addInvoice, addPayment } = useFinancial();
  const [entryType, setEntryType] = useState<'invoice' | 'payment'>('invoice');

  // Form states
  const [clientOrVendor, setClientOrVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<'Payroll' | 'Rent' | 'SaaS' | 'Inventory' | 'Tax' | 'Vendor' | 'Utilities' | 'Other'>('Vendor');
  const [status, setStatus] = useState<'pending' | 'overdue'>('pending');
  const [urgency, setUrgency] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [isFlexible, setIsFlexible] = useState(false);
  const [description, setDescription] = useState('');

  if (!isAddModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (entryType === 'invoice') {
      addInvoice({
        client: clientOrVendor || 'New Client Account',
        amount: numAmount,
        dueDate,
        status,
        daysOverdue: status === 'overdue' ? 7 : 0,
        probabilityOfDelay: status === 'overdue' ? 0.75 : 0.2,
        expectedDelayDays: status === 'overdue' ? 10 : 2,
        description: description || 'Consulting & Services Retainer'
      });
    } else {
      addPayment({
        vendor: clientOrVendor || 'Vendor Disbursement',
        amount: numAmount,
        dueDate,
        category,
        isFlexible,
        urgency,
        notes: description || 'Operational vendor payment'
      });
    }

    // Reset and close
    setClientOrVendor('');
    setAmount('');
    setDescription('');
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
              <h3 className="text-base font-bold text-slate-900">Add Cash Flow Item</h3>
              <p className="text-xs text-slate-500">Inject dynamic receivables or commitments into projection</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Receivable vs Outflow */}
        <div className="mt-5 grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
          <button
            type="button"
            onClick={() => setEntryType('invoice')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              entryType === 'invoice'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            <span>Expected Invoice (Inflow)</span>
          </button>

          <button
            type="button"
            onClick={() => setEntryType('payment')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              entryType === 'payment'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
            <span>Upcoming Payment (Outflow)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {entryType === 'invoice' ? 'Client / Payer Name' : 'Vendor / Obligation Name'}
            </label>
            <input
              type="text"
              required
              placeholder={entryType === 'invoice' ? 'e.g. Acme Corp Enterprise' : 'e.g. Server Fleet Cluster'}
              value={clientOrVendor}
              onChange={(e) => setClientOrVendor(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount ($ USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="15000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expected Due Date</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          {entryType === 'invoice' ? (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Receivable Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'pending' | 'overdue')}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="pending">Pending (Expected on due date)</option>
                <option value="overdue">Overdue (Delayed collection risk)</option>
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Payroll">Payroll</option>
                  <option value="Rent">Rent / Facilities</option>
                  <option value="SaaS">SaaS & Cloud</option>
                  <option value="Inventory">Inventory / Production</option>
                  <option value="Tax">Statutory Tax</option>
                  <option value="Vendor">Vendor / Agency</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Disbursement Flexibility</label>
                <div className="flex items-center h-10">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFlexible}
                      onChange={(e) => setIsFlexible(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span className="text-xs text-slate-700 font-medium">Can be rescheduled</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes / Description</label>
            <input
              type="text"
              placeholder="e.g. Q3 Deliverables Milestone Signoff"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

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
              Add to Simulation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
