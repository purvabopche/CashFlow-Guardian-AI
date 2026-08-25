import React, { useState } from 'react';
import { X, Mail, CheckCircle2, Copy, Send } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const InvoiceFollowUpModal: React.FC = () => {
  const {
    isInvoiceModalOpen,
    setIsInvoiceModalOpen,
    activeInvoiceForModal,
    formatCurrency,
    showToast
  } = useFinancial();

  const [copied, setCopied] = useState(false);

  if (!isInvoiceModalOpen || !activeInvoiceForModal) return null;

  const inv = activeInvoiceForModal;

  const defaultEmail = `Subject: Urgent Settlement Follow-Up: Invoice #${inv.id} (${formatCurrency(inv.amount)})\n\nHi ${inv.client} Accounts Payable Team,\n\nWe hope this note finds you well.\n\nWe are following up on Invoice #${inv.id} for ${formatCurrency(inv.amount)} (due ${inv.dueDate}), which is currently ${inv.daysOverdue || 0} days past due.\n\nCould you please confirm if this payment has been scheduled for disbursement this week? Direct UPI / bank routing details are attached.\n\nThank you for your prompt assistance,\nFinance Operations`;

  const [emailBody, setEmailBody] = useState(defaultEmail);

  const handleCopy = () => {
    navigator.clipboard.writeText(emailBody);
    setCopied(true);
    showToast('Payment reminder copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSend = () => {
    showToast(`Payment reminder dispatched to ${inv.client}!`);
    setIsInvoiceModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl border border-slate-200 space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 text-slate-800">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">1-Click Invoice Reminder</h3>
              <p className="text-[11px] text-slate-500">#{inv.id} • {inv.client} • {formatCurrency(inv.amount)}</p>
            </div>
          </div>
          <button
            onClick={() => setIsInvoiceModalOpen(false)}
            className="p-1 rounded text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>Client: <strong className="text-slate-900">{inv.client}</strong></span>
            <span className="font-mono text-rose-600 font-semibold">{inv.daysOverdue || 12}d Overdue</span>
          </div>

          <textarea
            rows={8}
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50/50 leading-relaxed"
          />
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-xs font-semibold text-white shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Reminder</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
