import React, { useState } from 'react';
import {
  X,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Building2,
  FileText,
  AlertCircle,
  RefreshCw,
  Tag
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { PaymentDirection } from '../../types/financial';

export const CreatePaymentModal: React.FC = () => {
  const {
    isCreatePaymentModalOpen,
    setIsCreatePaymentModalOpen,
    createPayment,
    currency,
    dataset
  } = useFinancial();

  const [direction, setDirection] = useState<PaymentDirection>('outgoing');
  const [counterparty, setCounterparty] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Vendor');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [invoiceReference, setInvoiceReference] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCreatePaymentModalOpen) return null;

  const categories = direction === 'outgoing' 
    ? ['Vendor', 'Rent', 'Payroll', 'SaaS', 'Inventory', 'Utilities', 'Tax', 'Other']
    : ['Income', 'Client Retainer', 'Milestone Deliverable', 'Subscription Renewal', 'Refund', 'Other'];

  const pendingInvoices = (dataset.invoices || []).filter(i => i.status !== 'paid');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    const trimmedCounterparty = counterparty.trim();
    if (!trimmedCounterparty) {
      setErrorMsg('Counterparty name is required.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid positive payment amount.');
      return;
    }

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setErrorMsg('Description or purpose is required.');
      return;
    }

    if (!scheduledDate) {
      setErrorMsg('Please select a valid scheduled payment date.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPayment({
        counterparty: trimmedCounterparty,
        description: trimmedDescription,
        amount: numAmount,
        direction,
        category,
        scheduledDate,
        invoiceReference: invoiceReference.trim() || undefined,
        isRecurring
      });

      // Reset form and close
      setCounterparty('');
      setAmount('');
      setDescription('');
      setInvoiceReference('');
      setIsRecurring(false);
      setIsCreatePaymentModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 font-sans">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Create new payment</h2>
              <p className="text-xs text-slate-500">
                Initializes as <span className="font-semibold text-amber-700">Pending</span> in the payment operations ledger
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreatePaymentModalOpen(false)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Error Banner */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-sans">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs font-sans">
          {/* 1. Direction Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Payment flow direction
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setDirection('outgoing');
                  setCategory('Vendor');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  direction === 'outgoing'
                    ? 'border-rose-300 bg-rose-50/80 text-rose-900 shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
                <span>Outgoing (disbursement)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDirection('incoming');
                  setCategory('Income');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  direction === 'incoming'
                    ? 'border-emerald-300 bg-emerald-50/80 text-emerald-900 shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                <span>Incoming (collection)</span>
              </button>
            </div>
          </div>

          {/* 2. Counterparty & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {direction === 'outgoing' ? 'Vendor / payee *' : 'Customer / payer *'}
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={direction === 'outgoing' ? 'e.g. AWS Cloud Services' : 'e.g. Acme Corp Retainer'}
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-1 focus:ring-slate-900 focus:outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount ({currency === 'INR' ? '₹ INR' : '$ USD'}) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-500 text-sm">
                  {currency === 'INR' ? '₹' : '$'}
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  step="any"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 font-mono text-sm font-semibold focus:ring-1 focus:ring-slate-900 focus:outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* 3. Category & Scheduled Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none text-slate-700"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scheduled / payment date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* 4. Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / business purpose *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <textarea
                rows={2}
                placeholder="Explain the commitment context (e.g. Monthly fixed lease commitment)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-1 focus:ring-slate-900 focus:outline-none placeholder:text-slate-400 resize-none"
              />
            </div>
          </div>

          {/* 5. Optional Invoice Link & Recurring Check */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Invoice reference (optional)
              </label>
              {pendingInvoices.length > 0 ? (
                <select
                  value={invoiceReference}
                  onChange={(e) => {
                    setInvoiceReference(e.target.value);
                    const matched = pendingInvoices.find(i => i.id === e.target.value);
                    if (matched) {
                      if (!counterparty) setCounterparty(matched.client);
                      if (!amount) setAmount(matched.amount.toString());
                      if (!description) setDescription(`Settlement for invoice #${matched.id}`);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none text-slate-700"
                >
                  <option value="">None / Standalone payment</option>
                  {pendingInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.id} ({inv.client} - {currency === 'INR' ? '₹' : '$'}{inv.amount.toLocaleString()})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. INV-2026-004"
                  value={invoiceReference}
                  onChange={(e) => setInvoiceReference(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-1 focus:ring-slate-900 focus:outline-none placeholder:text-slate-400"
                />
              )}
            </div>

            <div className="flex items-center pt-5">
              <label className="relative flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    Recurring payment
                  </span>
                  <span className="text-xs text-slate-400 block">Repeats on a scheduled monthly cadence</span>
                </div>
              </label>
            </div>
          </div>

          {/* Notice */}
          <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3 text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-900">Demo mode notice:</span> Payments are created with <strong>Pending</strong> status. Processing in Demo Mode will simulate realistic test clearance, record transactions, and trigger ML risk recalculation without moving real money.
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 font-sans">
            <button
              type="button"
              onClick={() => setIsCreatePaymentModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>{isSubmitting ? 'Creating...' : 'Create payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
