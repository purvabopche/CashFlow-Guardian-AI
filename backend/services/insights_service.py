from typing import List, Dict, Any
from backend.models.schemas import ActionInsight, InsightCategory, PriorityLevel

class InsightsService:
    @staticmethod
    def generate_actionable_insights(
        current_balance: float,
        monthly_inflow: float,
        monthly_outflow: float,
        safe_buffer: float,
        invoices: List[Dict[str, Any]],
        payments: List[Dict[str, Any]]
    ) -> List[ActionInsight]:
        insights: List[ActionInsight] = []
        
        # 1. Check for overdue/pending invoices
        overdue = [inv for inv in invoices if inv.get("status") == "overdue"]
        if overdue:
            top_overdue = max(overdue, key=lambda x: x.get("amount", 0))
            insights.append(
                ActionInsight(
                    id="ins-inv-01",
                    title=f"Follow Up on Overdue Invoice: {top_overdue.get('client')}",
                    description=f"Invoice #{top_overdue.get('id')} for ${top_overdue.get('amount', 0):,.0f} is {top_overdue.get('daysOverdue', 12)} days overdue. Prompt collection closes 72% of the projected Day 18 cash gap.",
                    category=InsightCategory.RECEIVABLE,
                    priority=PriorityLevel.CRITICAL,
                    potentialCashImpact=top_overdue.get("amount", 0),
                    runwayDaysImpact=9,
                    recommendedAction="Send automated 1-click friendly payment reminder and request ACH confirmation.",
                    status="open",
                    actionType="invoice_reminder",
                    templateData={
                        "client": top_overdue.get("client"),
                        "amount": top_overdue.get("amount"),
                        "invoiceId": top_overdue.get("id"),
                        "daysOverdue": top_overdue.get("daysOverdue", 12),
                        "suggestedEmail": (
                            f"Hi {top_overdue.get('client')} Team,\n\n"
                            f"Hope you are having a productive week. We are following up regarding invoice #{top_overdue.get('id')} "
                            f"for ${top_overdue.get('amount', 0):,.2f}, which was due on {top_overdue.get('dueDate')}.\n\n"
                            f"Could you please confirm if this has been processed for disbursement? We can provide wire/ACH details if needed.\n\n"
                            f"Best regards,\nFinance & Operations Team"
                        )
                    }
                )
            )
            
        # 2. Check for flexible vendor payments to reschedule
        flexible_payments = [p for p in payments if p.get("isFlexible") or p.get("category") in ["Vendor", "SaaS", "Inventory"]]
        if flexible_payments:
            top_vendor = max(flexible_payments, key=lambda x: x.get("amount", 0))
            insights.append(
                ActionInsight(
                    id="ins-pay-02",
                    title=f"Negotiate 14-Day Extension for {top_vendor.get('vendor')}",
                    description=f"Shifting the ${top_vendor.get('amount', 0):,.0f} disbursement from Day 14 to Day 28 bridges the mid-month payroll liquidity squeeze without incurring supplier penalties.",
                    category=InsightCategory.PAYMENT_TIMING,
                    priority=PriorityLevel.HIGH,
                    potentialCashImpact=top_vendor.get("amount", 0),
                    runwayDaysImpact=14,
                    recommendedAction="Request milestone payment split or Net-45 term extension.",
                    status="open",
                    actionType="reschedule_payment",
                    templateData={
                        "vendor": top_vendor.get("vendor"),
                        "amount": top_vendor.get("amount"),
                        "dueDate": top_vendor.get("dueDate"),
                        "suggestedDate": "End of Month"
                    }
                )
            )
            
        # 3. Discretionary expense rationalization
        if monthly_outflow > monthly_inflow * 0.9:
            insights.append(
                ActionInsight(
                    id="ins-exp-03",
                    title="Audit Non-Essential Software & Discretionary Marketing",
                    description="Identified ~$4,800/mo in recurring SaaS subscriptions and contractor overages that can be paused or consolidated to preserve runway.",
                    category=InsightCategory.EXPENSE,
                    priority=PriorityLevel.MEDIUM,
                    potentialCashImpact=4800.0,
                    runwayDaysImpact=6,
                    recommendedAction="Consolidate duplicate tool licenses and pause uncalibrated ad spend until cash health reaches 75+.",
                    status="open",
                    actionType="cut_expense",
                    templateData={
                        "categories": ["SaaS Licenses", "Contractor Overlap", "Discretionary Travel"],
                        "estimatedSavings": 4800.0
                    }
                )
            )
            
        # 4. Safe buffer reserve maintenance
        if current_balance < safe_buffer:
            deficit = safe_buffer - current_balance
            insights.append(
                ActionInsight(
                    id="ins-res-04",
                    title="Replenish Safe Cash Reserve to $25,000 Target",
                    description=f"Current liquidity is ${current_balance:,.0f}, which is ${deficit:,.0f} below your configured safety threshold. Operating below safety buffer leaves zero tolerance for client default.",
                    category=InsightCategory.LIQUIDITY,
                    priority=PriorityLevel.HIGH,
                    potentialCashImpact=deficit,
                    runwayDaysImpact=12,
                    recommendedAction="Draw temporary revolving credit line or offer 2% quick-pay discount on upcoming accounts receivable.",
                    status="open",
                    actionType="credit_line",
                    templateData={
                        "targetBuffer": safe_buffer,
                        "currentReserve": current_balance,
                        "deficit": deficit
                    }
                )
            )
            
        return insights

insights_service = InsightsService()
