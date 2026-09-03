from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from ..models.schemas import ForecastDay, ForecastResponse, RiskLevel

class ForecastService:
    @staticmethod
    def generate_forecast(
        current_balance: float,
        monthly_inflow: float,
        monthly_outflow: float,
        safe_buffer: float,
        days_count: int = 30,
        invoices: Optional[List[Dict[str, Any]]] = None,
        payments: Optional[List[Dict[str, Any]]] = None,
        scenario_delay_days: int = 0,
        scenario_expense: float = 0.0,
        scenario_rev_pct: float = 0.0,
        vendor_shift_days: int = 0
    ) -> ForecastResponse:
        invoices = invoices or []
        payments = payments or []
        
        forecast_days: List[ForecastDay] = []
        running_balance = current_balance
        
        base_daily_inflow = (monthly_inflow * (1.0 + scenario_rev_pct / 100.0)) / 30.0
        base_daily_outflow = monthly_outflow / 30.0
        
        start_date = datetime.now()
        lowest_point = current_balance
        days_below_threshold = 0
        first_breach_date = None
        
        for i in range(days_count):
            cur_date = start_date + timedelta(days=i)
            date_str = cur_date.strftime("%b %d")
            
            # Baseline daily baseline flow
            day_inflow = base_daily_inflow * (0.85 + 0.3 * ((i * 7) % 5) / 5.0)
            day_outflow = base_daily_outflow * (0.9 + 0.2 * ((i * 3) % 4) / 4.0)
            
            # Specific calendar spikes:
            # Payroll on day 15 and 30
            if cur_date.day in [15, 30] or i in [14, 29]:
                day_outflow += (monthly_outflow * 0.35)
                
            # Rent on day 1
            if cur_date.day == 1 or i == 0:
                day_outflow += (monthly_outflow * 0.15)
                
            # If scenario lump sum expense applied on day 7
            if i == 7 and scenario_expense > 0:
                day_outflow += scenario_expense
                
            # Add scheduled invoice receipts (factoring delay)
            for inv in invoices:
                # Mock date matching
                inv_day = (hash(inv.get("id", "")) % 25) + scenario_delay_days
                if inv_day == i:
                    day_inflow += inv.get("amount", 0) * 0.95
                    
            # Add scheduled payments (factoring vendor shift)
            for pay in payments:
                pay_day = max(0, (hash(pay.get("id", "")) % 28) + vendor_shift_days)
                if pay_day == i:
                    day_outflow += pay.get("amount", 0)
                    
            running_balance += (day_inflow - day_outflow)
            
            is_below = running_balance < safe_buffer
            if is_below:
                days_below_threshold += 1
                if not first_breach_date:
                    first_breach_date = date_str
                    
            if running_balance < lowest_point:
                lowest_point = running_balance
                
            if running_balance < 0:
                day_risk = RiskLevel.CRITICAL
            elif running_balance < safe_buffer:
                day_risk = RiskLevel.HIGH
            elif running_balance < safe_buffer * 1.3:
                day_risk = RiskLevel.MEDIUM
            else:
                day_risk = RiskLevel.LOW
                
            forecast_days.append(
                ForecastDay(
                    date=date_str,
                    dayIndex=i + 1,
                    projectedBalance=round(running_balance, 2),
                    predictedInflow=round(day_inflow, 2),
                    predictedOutflow=round(day_outflow, 2),
                    netChange=round(day_inflow - day_outflow, 2),
                    isBelowThreshold=is_below,
                    riskLevel=day_risk
                )
            )
            
        return ForecastResponse(
            forecastDays=forecast_days,
            safeBufferThreshold=safe_buffer,
            lowestProjectedPoint=round(lowest_point, 2),
            daysBelowThresholdCount=days_below_threshold,
            predictedBreachDate=first_breach_date
        )

forecast_service = ForecastService()
