import { FinancialDataset, Transaction } from '../types/financial';

const generateHistoricalTransactions = (): Transaction[] => [
  {
    id: 'tx-101',
    date: '2026-08-25',
    title: 'Swiggy Gourmet Dinner & Groceries',
    category: 'Food & Dining',
    type: 'expense',
    amount: 1450,
    isRecurring: false,
    isDiscretionary: true,
    merchant: 'Swiggy Instamart'
  },
  {
    id: 'tx-102',
    date: '2026-08-24',
    title: 'Uber Premier Airport Commute',
    category: 'Travel & Commute',
    type: 'expense',
    amount: 1120,
    isRecurring: false,
    isDiscretionary: true,
    merchant: 'Uber India'
  },
  {
    id: 'tx-103',
    date: '2026-08-22',
    title: 'Figma & Notion Team Licenses',
    category: 'Subscriptions',
    type: 'expense',
    amount: 3200,
    isRecurring: true,
    isDiscretionary: false,
    merchant: 'Figma Inc'
  },
  {
    id: 'tx-104',
    date: '2026-08-20',
    title: 'Freelance Client Retainer Milestone',
    category: 'Income',
    type: 'income',
    amount: 38000,
    isRecurring: false,
    isDiscretionary: false,
    merchant: 'Razorpay Payouts'
  },
  {
    id: 'tx-105',
    date: '2026-08-18',
    title: 'Blue Tokai Cafe & Team Breakfast',
    category: 'Food & Dining',
    type: 'expense',
    amount: 880,
    isRecurring: false,
    isDiscretionary: true,
    merchant: 'Blue Tokai Coffee'
  },
  {
    id: 'tx-106',
    date: '2026-08-15',
    title: 'AWS Cloud Hosting Cluster',
    category: 'Subscriptions',
    type: 'expense',
    amount: 4800,
    isRecurring: true,
    isDiscretionary: false,
    merchant: 'Amazon Web Services'
  },
  {
    id: 'tx-107',
    date: '2026-08-12',
    title: 'Nature Basket Organic Groceries',
    category: 'Groceries',
    type: 'expense',
    amount: 3400,
    isRecurring: false,
    isDiscretionary: false,
    merchant: 'Nature Basket'
  },
  {
    id: 'tx-108',
    date: '2026-08-10',
    title: 'Airtel Fiber Broadband & 5G',
    category: 'Utilities',
    type: 'expense',
    amount: 1499,
    isRecurring: true,
    isDiscretionary: false,
    merchant: 'Airtel Digital'
  },
  {
    id: 'tx-109',
    date: '2026-08-08',
    title: 'Zomato Food Delivery',
    category: 'Food & Dining',
    type: 'expense',
    amount: 720,
    isRecurring: false,
    isDiscretionary: true,
    merchant: 'Zomato Ltd'
  },
  {
    id: 'tx-110',
    date: '2026-08-05',
    title: 'Amazon Equipment & Ergonomic Monitor',
    category: 'Equipment & Capex',
    type: 'expense',
    amount: 12500,
    isRecurring: false,
    isDiscretionary: true,
    merchant: 'Amazon India'
  },
  {
    id: 'tx-111',
    date: '2026-08-01',
    title: 'Studio Apartment Rent & Maintenance',
    category: 'Rent & Living',
    type: 'expense',
    amount: 24000,
    isRecurring: true,
    isDiscretionary: false,
    merchant: 'Direct Bank NEFT'
  },
  {
    id: 'tx-112',
    date: '2026-08-01',
    title: 'Monthly Primary Client Retainer Deposit',
    category: 'Income',
    type: 'income',
    amount: 55000,
    isRecurring: true,
    isDiscretionary: false,
    merchant: 'Stripe Direct Deposit'
  }
];

export const BUSINESS_DATASETS: Record<string, FinancialDataset> = {
  freelancer_pro: {
    id: 'freelancer_pro',
    name: 'Aarav Sharma (Product Designer & Agency)',
    industry: 'Design & Independent Consulting',
    description: 'High-growth independent design consultant with lump-sum client milestone retainers, SaaS overhead, and recurring home-office rent.',
    currentBalance: 34500,
    monthlyInflow: 68000,
    monthlyOutflow: 62000,
    safeBufferThreshold: 15000,
    transactions: generateHistoricalTransactions(),
    invoices: [
      {
        id: 'INV-1042',
        client: 'FinTech Startup Design System',
        amount: 28500,
        dueDate: '2026-09-06',
        status: 'overdue',
        daysOverdue: 12,
        probabilityOfDelay: 0.85,
        expectedDelayDays: 16,
        description: 'Complete UI/UX design token system and mobile design library'
      },
      {
        id: 'INV-1045',
        client: 'HealthTech Platform Q3 Retainer',
        amount: 18000,
        dueDate: '2026-09-14',
        status: 'pending',
        daysOverdue: 0,
        probabilityOfDelay: 0.20,
        expectedDelayDays: 2,
        description: 'Monthly ongoing UX sprint retainer'
      },
      {
        id: 'INV-1048',
        client: 'E-Commerce Mobile App Audit',
        amount: 14000,
        dueDate: '2026-09-22',
        status: 'pending',
        daysOverdue: 0,
        probabilityOfDelay: 0.35,
        expectedDelayDays: 6,
        description: 'Conversion rate optimization UX audit and user research report'
      }
    ],
    payments: [
      {
        id: 'PAY-801',
        vendor: 'Studio Workspace & Residence Rent',
        amount: 22000,
        dueDate: '2026-09-01',
        category: 'Rent',
        isFlexible: false,
        urgency: 'Critical',
        notes: 'Monthly fixed lease commitment'
      },
      {
        id: 'PAY-802',
        vendor: 'Subcontracted 3D Motion Specialist',
        amount: 15000,
        dueDate: '2026-09-15',
        category: 'Payroll',
        isFlexible: true,
        urgency: 'High',
        notes: 'Can negotiate a 10-day milestone extension'
      },
      {
        id: 'PAY-803',
        vendor: 'Hardware Lease & MacBook EMI',
        amount: 6800,
        dueDate: '2026-09-10',
        category: 'Vendor',
        isFlexible: false,
        urgency: 'High',
        notes: 'Auto-debit from primary account'
      },
      {
        id: 'PAY-804',
        vendor: 'Figma, Adobe CC, Midjourney & Notion',
        amount: 3800,
        dueDate: '2026-09-08',
        category: 'SaaS',
        isFlexible: true,
        urgency: 'Low',
        notes: 'Software tools stack'
      },
      {
        id: 'PAY-805',
        vendor: 'Quarterly Advance Tax Installment',
        amount: 11500,
        dueDate: '2026-09-22',
        category: 'Tax',
        isFlexible: false,
        urgency: 'Critical',
        notes: 'Statutory deadline to avoid interest charges'
      }
    ]
  },

  tech_startup: {
    id: 'tech_startup',
    name: 'NovaScale AI (B2B SaaS Startup)',
    industry: 'Enterprise Software & Cloud',
    description: 'High-growth B2B SaaS company managing 18-month runway, bi-weekly engineering payroll, and enterprise Net-45 receivables.',
    currentBalance: 42500,
    monthlyInflow: 58000,
    monthlyOutflow: 64500,
    safeBufferThreshold: 25000,
    transactions: generateHistoricalTransactions(),
    invoices: [
      {
        id: 'INV-1042',
        client: 'Apex Global Logistics',
        amount: 18500,
        dueDate: '2026-09-05',
        status: 'overdue',
        daysOverdue: 14,
        probabilityOfDelay: 0.85,
        expectedDelayDays: 18,
        description: 'Annual Enterprise Cloud Platform License Tier 1'
      },
      {
        id: 'INV-1045',
        client: 'Horizon Media Group',
        amount: 12200,
        dueDate: '2026-09-12',
        status: 'pending',
        daysOverdue: 0,
        probabilityOfDelay: 0.20,
        expectedDelayDays: 2,
        description: 'Quarterly API Volume & Custom Integration Retainer'
      },
      {
        id: 'INV-1048',
        client: 'Vertex BioLabs',
        amount: 9400,
        dueDate: '2026-09-18',
        status: 'pending',
        daysOverdue: 0,
        probabilityOfDelay: 0.40,
        expectedDelayDays: 7,
        description: 'Data Analytics Module Addon'
      },
      {
        id: 'INV-1051',
        client: 'Starlight Ventures Portfolio',
        amount: 15000,
        dueDate: '2026-09-26',
        status: 'pending',
        daysOverdue: 0,
        probabilityOfDelay: 0.15,
        expectedDelayDays: 0,
        description: 'Multi-Seat Enterprise Expansion Contract'
      }
    ],
    payments: [
      {
        id: 'PAY-801',
        vendor: 'Gusto Bi-Weekly Engineering Payroll',
        amount: 24000,
        dueDate: '2026-09-15',
        category: 'Payroll',
        isFlexible: false,
        urgency: 'Critical',
        notes: 'Non-negotiable core engineering & sales team compensation'
      },
      {
        id: 'PAY-802',
        vendor: 'AWS Cloud Infrastructure Cluster',
        amount: 6200,
        dueDate: '2026-09-08',
        category: 'SaaS',
        isFlexible: true,
        urgency: 'Medium',
        notes: 'Can activate 30-day AWS billing grace period'
      },
      {
        id: 'PAY-803',
        vendor: 'WeWork Office Space Lease',
        amount: 5500,
        dueDate: '2026-09-01',
        category: 'Rent',
        isFlexible: false,
        urgency: 'High',
        notes: 'Monthly headquarters co-working lease'
      },
      {
        id: 'PAY-804',
        vendor: 'Acquisition Growth Agency Retainer',
        amount: 8500,
        dueDate: '2026-09-19',
        category: 'Vendor',
        isFlexible: true,
        urgency: 'Medium',
        notes: 'Paid marketing agency - can be paused or deferred'
      },
      {
        id: 'PAY-805',
        vendor: 'Quarterly State Tax Escrow',
        amount: 9800,
        dueDate: '2026-09-22',
        category: 'Tax',
        isFlexible: false,
        urgency: 'Critical',
        notes: 'Statutory deadline to avoid penalties'
      }
    ]
  },

  ecommerce: {
    id: 'ecommerce',
    name: 'Lumina Goods (E-Commerce Direct-to-Consumer)',
    industry: 'Consumer Goods & Retail',
    description: 'Direct-to-consumer lifestyle brand balancing high manufacturing inventory lead times, Meta ad spending, and merchant processor settlement cycles.',
    currentBalance: 68000,
    monthlyInflow: 112000,
    monthlyOutflow: 118000,
    safeBufferThreshold: 40000,
    transactions: generateHistoricalTransactions(),
    invoices: [
      {
        id: 'INV-EC-201',
        client: 'Shopify Merchant Payouts (Weekly)',
        amount: 42000,
        dueDate: '2026-09-04',
        status: 'pending',
        daysOverdue: 0,
        probabilityOfDelay: 0.05,
        expectedDelayDays: 1,
        description: 'Direct consumer sales batch deposit'
      },
      {
        id: 'INV-EC-202',
        client: 'Amazon Seller Central Settlement',
        amount: 38000,
        dueDate: '2026-09-14',
        status: 'pending',
        daysOverdue: 0,
        probabilityOfDelay: 0.10,
        expectedDelayDays: 2,
        description: 'Bi-weekly Amazon marketplace disbursement'
      },
      {
        id: 'INV-EC-203',
        client: 'Nordstrom Wholesale B2B Purchase Order',
        amount: 26500,
        dueDate: '2026-09-02',
        status: 'overdue',
        daysOverdue: 9,
        probabilityOfDelay: 0.65,
        expectedDelayDays: 14,
        description: 'Autumn catalog seasonal retail order'
      }
    ],
    payments: [
      {
        id: 'PAY-EC-101',
        vendor: 'Overseas Factory Bulk Production (50% Deposit)',
        amount: 52000,
        dueDate: '2026-09-16',
        category: 'Inventory',
        isFlexible: true,
        urgency: 'High',
        notes: 'Holiday season inventory batch - can negotiate 14-day bill of lading hold'
      },
      {
        id: 'PAY-EC-102',
        vendor: 'Meta & TikTok Performance Ad Spend',
        amount: 28000,
        dueDate: '2026-09-10',
        category: 'Vendor',
        isFlexible: true,
        urgency: 'Medium',
        notes: 'Direct ad campaign charges; can adjust daily budget caps'
      },
      {
        id: 'PAY-EC-103',
        vendor: '3PL Fulfillment & Warehousing Depot',
        amount: 16500,
        dueDate: '2026-09-20',
        category: 'Vendor',
        isFlexible: false,
        urgency: 'High',
        notes: 'Shipping & warehouse operations'
      },
      {
        id: 'PAY-EC-104',
        vendor: 'Core Operations & Support Payroll',
        amount: 14000,
        dueDate: '2026-09-15',
        category: 'Payroll',
        isFlexible: false,
        urgency: 'Critical',
        notes: 'Full-time support and operations staff'
      }
    ]
  }
};
