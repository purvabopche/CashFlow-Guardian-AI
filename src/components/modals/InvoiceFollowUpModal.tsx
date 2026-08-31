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
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl border border-slate-200 space-y-3.5 font-sans">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Send invoice reminder</h3>
              <p className="text-xs text-slate-500 font-medium">#{inv.id} • {inv.client} • {formatCurrency(inv.amount)}</p>
            </div>
          </div>
          <button
            onClick={() => setIsInvoiceModalOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 text-sm font-sans">
          <div className="flex justify-between items-center text-slate-600">
            <span>Customer: <strong className="text-slate-900">{inv.client}</strong></span>
            <span className="text-rose-600 font-semibold text-xs">{inv.daysOverdue || 12} days overdue</span>
          </div>

          <textarea
            rows={8}
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900 font-sans focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50/50 leading-relaxed"
          />
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 font-sans">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors btn-interactive"
          >
            <Copy className="w-4 h-4 text-slate-400" />
            <span>{copied ? 'Copied!' : 'Copy text'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-sm font-semibold text-white shadow-xs btn-interactive"
            >
              <Send className="w-4 h-4" />
              <span>Send reminder</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
