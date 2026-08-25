import React, { useState } from 'react';
import { X, Mail, Copy, Check, Send, Sparkles, Clock, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinancial } from '../../context/FinancialContext';

export const InvoiceFollowUpModal: React.FC = () => {
  const {
    isInvoiceModalOpen,
    setIsInvoiceModalOpen,
    activeInvoiceForModal,
    updateInvoiceStatus,
    showToast
  } = useFinancial();

  const [copied, setCopied] = useState(false);
  const [includeDiscount, setIncludeDiscount] = useState(false);

  if (!isInvoiceModalOpen || !activeInvoiceForModal) return null;

  const inv = activeInvoiceForModal;
  const isOverdue = inv.status === 'overdue';

  const discountAmount = Math.round(inv.amount * 0.02);
  const discountedTotal = inv.amount - discountAmount;

  const emailSubject = `Payment Status Inquiry - Invoice #${inv.id} ($${inv.amount.toLocaleString()}) - ${inv.client}`;

  const emailBody = `Hi ${inv.client} Accounts Payable Team,

Hope you are having a productive week.

We are writing to follow up on Invoice #${inv.id} for the amount of $${inv.amount.toLocaleString()} (Due date: ${inv.dueDate}), which is currently ${isOverdue ? `overdue by ${inv.daysOverdue || 12} days` : 'scheduled for upcoming disbursement'}.

${
  includeDiscount
    ? `⚡ Quick-Pay Incentive: If settled within the next 48 hours via direct ACH/wire, we are pleased to offer an immediate 2.0% early settlement deduction, adjusting the net balance to $${discountedTotal.toLocaleString()}.\n`
    : ''
}Could you please confirm if this invoice has been scheduled in your upcoming payment run? If you require updated wire coordinates or another copy of the invoice, please let us know.

Thank you for your ongoing partnership.

Warm regards,
Finance & Accounts Receivable Operations
CashFlow Guardian Client Portal`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopied(true);
    showToast('Reminder email copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendSimulated = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {
      // ignore
    }
    updateInvoiceStatus(inv.id, 'pending');
    showToast(`Payment reminder dispatched to ${inv.client}! Collection priority updated.`);
    setIsInvoiceModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Invoice Collection Accelerator</h3>
              <p className="text-xs text-slate-500">Automated reminder for Invoice #{inv.id}</p>
            </div>
          </div>
          <button
            onClick={() => setIsInvoiceModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice highlight pill */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs">
          <div>
            <span className="font-bold text-slate-900">{inv.client}</span>
            <div className="text-slate-500 text-[11px] mt-0.5">Due: {inv.dueDate}</div>
          </div>
          <div className="text-right">
            <span className="font-bold text-sm text-slate-900">${inv.amount.toLocaleString()}</span>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              <Clock className="w-3 h-3 text-rose-500" />
              <span className="text-rose-600 font-semibold text-[11px]">
                {isOverdue ? `${inv.daysOverdue || 12}d Overdue` : 'Due Soon'}
              </span>
            </div>
          </div>
        </div>

        {/* Incentive option */}
        <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-emerald-900 font-medium">
              Include 2% ($ {discountAmount.toLocaleString()}) Early Payment Waiver
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={includeDiscount}
              onChange={(e) => setIncludeDiscount(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Email Preview */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Subject:</span>
            <span className="text-[11px] text-slate-500 font-mono truncate max-w-sm">{emailSubject}</span>
          </div>
          <textarea
            readOnly
            value={emailBody}
            rows={8}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs font-mono text-slate-800 leading-relaxed focus:outline-none resize-none"
          />
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInvoiceModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendSimulated}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send & Track Delivery</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
