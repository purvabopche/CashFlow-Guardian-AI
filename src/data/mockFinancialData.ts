import { FinancialDataset, Transaction } from '../types/financial';

export const HACKATHON_SCENARIOS: Record<string, FinancialDataset> = {
  critical_shortage: {
    id: 'critical_shortage',
    name: '🔴 Critical Shortage (Deficit in 12 Days)',
    industry: 'Independent Consulting / SME',
    description: 'Imminent mid-month liquidity crisis: ₹28,500 overdue client invoice collides with ₹22,000 fixed rent and ₹15,000 contractor payroll.',
    currentBalance: 34500,
    monthlyInflow: 68000,
    monthlyOutflow: 74000,
    safeBufferThreshold: 15000,
    transactions: [
      { id: 'tx-c1', date: '2026-08-25', title: 'Zomato & Dining Out', category: 'Food & Dining', type: 'expense', amount: 1650, isRecurring: false, isDiscretionary: true },
      { id: 'tx-c2', date: '2026-08-24', title: 'Uber Premier City Rides', category: 'Travel & Commute', type: 'expense', amount: 1280, isRecurring: false, isDiscretionary: true },
      { id: 'tx-c3', date: '2026-08-22', title: 'Figma, Adobe CC & Notion Stack', category: 'Subscriptions', type: 'expense', amount: 4800, isRecurring: true, isDiscretionary: false },
      { id: 'tx-c4', date: '2026-08-18', title: 'Nature Basket Groceries', category: 'Groceries', type: 'expense', amount: 3600, isRecurring: false, isDiscretionary: false },
      { id: 'tx-c5', date: '2026-08-15', title: 'AWS Cloud Compute Fleet', category: 'Subscriptions', type: 'expense', amount: 6200, isRecurring: true, isDiscretionary: false },
      { id: 'tx-c6', date: '2026-08-10', title: 'Airtel Fiber Gigabit Broadband', category: 'Utilities', type: 'expense', amount: 1499, isRecurring: true, isDiscretionary: false },
      { id: 'tx-c7', date: '2026-08-01', title: 'Studio Residence Lease Payment', category: 'Rent & Living', type: 'expense', amount: 22000, isRecurring: true, isDiscretionary: false },
      { id: 'tx-c8', date: '2026-08-01', title: 'Primary Client Retainer Deposit', category: 'Income', type: 'income', amount: 45000, isRecurring: true, isDiscretionary: false }
    ],
    invoices: [
      {
        id: 'INV-CRIT-01',
        client: 'FinTech Startup Design System Sprint',
        amount: 28500,
        dueDate: '2026-09-04',
        status: 'overdue',
        daysOverdue: 14,
        probabilityOfDelay: 0.88,
        expectedDelayDays: 18,
        description: 'Complete UI design token library & mobile design sprint'
      },
      {
        id: 'INV-CRIT-02',
        client: 'HealthTech Platform Q3 Retainer',
        amount: 16000,
        dueDate: '2026-09-18',
        status: 'pending',
        daysOverdue: 0,
        probabilityOfDelay: 0.25,
        expectedDelayDays: 3,
        description: 'Monthly UX Research & Design Sprint'
      }
    ],
    payments: [
      {
        id: 'PAY-CRIT-01',
        vendor: 'Studio Workspace Lease',
        amount: 22000,
        dueDate: '2026-09-01',
        category: 'Rent',
        isFlexible: false,
        urgency: 'Critical',
        notes: 'Monthly fixed lease commitment'
      },
      {
        id: 'PAY-CRIT-02',
        vendor: 'Subcontracted 3D Motion Specialist',
        amount: 15000,
        dueDate: '2026-09-15',
        category: 'Payroll',
        isFlexible: true,
        urgency: 'High',
        notes: 'Can negotiate 10-day milestone payment extension'
      },
      {
        id: 'PAY-CRIT-03',
        vendor: 'MacBook Pro Hardware EMI',
        amount: 8500,
        dueDate: '2026-09-10',
        category: 'Vendor',
        isFlexible: false,
        urgency: 'High',
        notes: 'Auto-debit from primary bank'
      },
      {
        id: 'PAY-CRIT-04',
        vendor: 'Quarterly Advance Tax Installment',
        amount: 12500,
        dueDate: '2026-09-22',
        category: 'Tax',
        isFlexible: false,
        urgency: 'Critical',
        notes: 'Statutory deadline to avoid penalty interest'
      }
    ]
  },

  medium_risk: {
    id: 'medium_risk',
    name: '🟡 Medium Risk (Moderate Runway ~24 Days)',
    industry: 'Growth B2B SaaS',
    description: 'Operating near safe buffer threshold: revenue covers payroll but unexpected client delays create end-of-month pressure.',
    currentBalance: 52000,
    monthlyInflow: 78000,
    monthlyOutflow: 72000,
    safeBufferThreshold: 25000,
    transactions: [
      { id: 'tx-m1', date: '2026-08-25', title: 'Team Lunches & Client Meetings', category: 'Food & Dining', type: 'expense', amount: 2400, isRecurring: false, isDiscretionary: true },
      { id: 'tx-m2', date: '2026-08-21', title: 'Stripe SaaS Subscriptions Batch', category: 'Income', type: 'income', amount: 35000, isRecurring: true, isDiscretionary: false },
      { id: 'tx-m3', date: '2026-08-15', title: 'Engineering Team Bi-Weekly Payroll', category: 'Payroll & Team', type: 'expense', amount: 28000, isRecurring: true, isDiscretionary: false },
      { id: 'tx-m4', date: '2026-08-08', title: 'Google Workspace & Slack Seats', category: 'Subscriptions', type: 'expense', amount: 3400, isRecurring: true, isDiscretionary: false },
      { id: 'tx-m5', date: '2026-08-01', title: 'Co-Working Office Space', category: 'Rent & Living', type: 'expense', amount: 14000, isRecurring: true, isDiscretionary: false }
    ],
    invoices: [
      {
        id: 'INV-MED-01',
        client: 'Enterprise Tier-1 License Payout',
        amount: 24000,
        dueDate: '2026-09-12',
        status: 'pending',
        daysOverdue: 0,
        probabilityOfDelay: 0.35,
        expectedDelayDays: 6,
        description: 'Quarterly enterprise contract renewal'
      },
      {
        id: 'INV-MED-02',
        client: 'Custom Integration Retainer',
        amount: 19000,
        dueDate: '2026-09-25',
        status: 'pending',
        daysOverdue: 0,
        probabilityOfDelay: 0.15,
        expectedDelayDays: 0,
        description: 'API integration milestone deliverable'
      }
    ],
    payments: [
      {
        id: 'PAY-MED-01',
        vendor: 'Core Engineering Payroll',
        amount: 28000,
        dueDate: '2026-09-15',
        category: 'Payroll',
        isFlexible: false,
        urgency: 'Critical',
        notes: 'Monthly engineering compensation'
      },
      {
        id: 'PAY-MED-02',
        vendor: 'AWS Cloud Infrastructure Cluster',
        amount: 8500,
        dueDate: '2026-09-08',
        category: 'SaaS',
        isFlexible: true,
        urgency: 'Medium',
        notes: 'Flexible 30-day billing cycle'
      },
      {
        id: 'PAY-MED-03',
        vendor: 'Growth Marketing Agency Retainer',
        amount: 11000,
        dueDate: '2026-09-19',
        category: 'Vendor',
        isFlexible: true,
        urgency: 'Medium',
        notes: 'Paid marketing agency'
      }
    ]
  },

  healthy_safe: {
    id: 'healthy_safe',
    name: '🟢 Healthy & Safe (Strong Cash Buffer)',
    industry: 'Profitable E-Commerce & Retail',
    description: 'Robust liquidity resilience: >3.5x buffer coverage, strong recurring monthly surplus, and prompt customer settlement cycles.',
    currentBalance: 98000,
    monthlyInflow: 135000,
    monthlyOutflow: 88000,
    safeBufferThreshold: 20000,
    transactions: [
      { id: 'tx-s1', date: '2026-08-25', title: 'Shopify Merchant Settlements Batch', category: 'Income', type: 'income', amount: 48000, isRecurring: true, isDiscretionary: false },
      { id: 'tx-s2', date: '2026-08-20', title: 'Amazon Marketplace Payout', category: 'Income', type: 'income', amount: 52000, isRecurring: true, isDiscretionary: false },
      { id: 'tx-s3', date: '2026-08-15', title: 'Warehouse Fulfillment Logistics', category: 'Utilities', type: 'expense', amount: 16000, isRecurring: true, isDiscretionary: false },
      { id: 'tx-s4', date: '2026-08-10', title: 'Meta & TikTok Performance Ads', category: 'Shopping', type: 'expense', amount: 22000, isRecurring: true, isDiscretionary: true },
      { id: 'tx-s5', date: '2026-08-01', title: 'Staff Payroll & Operations', category: 'Payroll & Team', type: 'expense', amount: 26000, isRecurring: true, isDiscretionary: false }
    ],
    invoices: [
      {
        id: 'INV-SAFE-01',
        client: 'Wholesale Retailer Purchase Order',
        amount: 35000,
        dueDate: '2026-09-08',
        status: 'pending',
        daysOverdue: 0,
        probabilityOfDelay: 0.05,
        expectedDelayDays: 0,
        description: 'Autumn wholesale shipment deposit'
      }
    ],
    payments: [
      {
        id: 'PAY-SAFE-01',
        vendor: 'Inventory Factory Production Batch',
        amount: 32000,
        dueDate: '2026-09-16',
        category: 'Inventory',
        isFlexible: true,
        urgency: 'Medium',
        notes: 'Seasonal replenishment batch'
      },
      {
        id: 'PAY-SAFE-02',
        vendor: 'Staff Operations Payroll',
        amount: 26000,
        dueDate: '2026-09-15',
        category: 'Payroll',
        isFlexible: false,
        urgency: 'Critical',
        notes: 'Full-time support operations'
      }
    ]
  }
};

export const BUSINESS_DATASETS = HACKATHON_SCENARIOS;
