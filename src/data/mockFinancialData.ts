import { FinancialDataset } from '../types/financial';

export const BUSINESS_DATASETS: Record<string, FinancialDataset> = {
  tech_startup: {
    id: 'tech_startup',
    name: 'NovaScale AI (B2B SaaS Startup)',
    industry: 'Enterprise Software & Cloud',
    description: 'High-growth B2B SaaS company managing 18-month runway, bi-weekly payroll, and enterprise Net-45 receivables.',
    currentBalance: 42500,
    monthlyInflow: 58000,
    monthlyOutflow: 64500,
    safeBufferThreshold: 25000,
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
      },
      {
        id: 'INV-1039',
        client: 'Zenith Security',
        amount: 8600,
        dueDate: '2026-08-20',
        status: 'paid',
        daysOverdue: 0,
        description: 'Implementation & SSO Onboarding Fee'
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
  },

  agency: {
    id: 'agency',
    name: 'Kite Creative (Design & Product Agency)',
    industry: 'Digital Agency & Consulting',
    description: 'High-end digital product design studio with high payroll overhead and recurring delays in client sign-offs and invoice disbursements.',
    currentBalance: 31000,
    monthlyInflow: 48000,
    monthlyOutflow: 45000,
    safeBufferThreshold: 20000,
    invoices: [
      {
        id: 'INV-AG-301',
        client: 'FinTech Unicorn Web App Redesign',
        amount: 22000,
        dueDate: '2026-08-28',
        status: 'overdue',
        daysOverdue: 21,
        probabilityOfDelay: 0.90,
        expectedDelayDays: 25,
        description: 'Phase 2 Milestone Completion signoff'
      },
      {
        id: 'INV-AG-302',
        client: 'HealthTech Retainer Q3',
        amount: 14000,
        dueDate: '2026-09-10',
        status: 'pending',
        daysOverdue: 0,
        probabilityOfDelay: 0.25,
        expectedDelayDays: 5,
        description: 'Monthly UX Research & Design Sprint Retainer'
      },
      {
        id: 'INV-AG-303',
        client: 'CleanTech Mobile App MVP SOW',
        amount: 16000,
        dueDate: '2026-09-24',
        status: 'pending',
        daysOverdue: 0,
        probabilityOfDelay: 0.35,
        expectedDelayDays: 8,
        description: 'Initial deposit for 8-week design sprint'
      }
    ],
    payments: [
      {
        id: 'PAY-AG-201',
        vendor: 'Product Designers & Contractors Payroll',
        amount: 28000,
        dueDate: '2026-09-15',
        category: 'Payroll',
        isFlexible: false,
        urgency: 'Critical',
        notes: 'Principal designers and contracted UI specialists'
      },
      {
        id: 'PAY-AG-202',
        vendor: 'Figma, Adobe Creative Cloud, & Notion Enterprise',
        amount: 2400,
        dueDate: '2026-09-05',
        category: 'SaaS',
        isFlexible: true,
        urgency: 'Low',
        notes: 'Design software tooling stack'
      },
      {
        id: 'PAY-AG-203',
        vendor: 'Senior 3D Motion Animator Contractor',
        amount: 6500,
        dueDate: '2026-09-18',
        category: 'Vendor',
        isFlexible: true,
        urgency: 'Medium',
        notes: 'Deliverable milestone payment for client video'
      },
      {
        id: 'PAY-AG-204',
        vendor: 'Design Studio Loft Lease',
        amount: 4200,
        dueDate: '2026-09-01',
        category: 'Rent',
        isFlexible: false,
        urgency: 'High',
        notes: 'Office lease downtown'
      }
    ]
  }
};
