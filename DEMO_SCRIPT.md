# CashFlow Guardian AI 🎬
## 3-Minute Live Demonstration Script

*Total Presentation Time: 3 minutes (180 seconds)*  
*Setup: Browser open at `http://localhost:3000/` with FastAPI backend running on port 8000.*

---

### Phase 1: Problem & Initial Dashboard View [0:00 – 0:45]

**[0:00 – 0:20] Screen: Show Landing / Intro Bar at top of Dashboard**
- **Action**: Keep the dashboard open on the **Critical Shortage** demo profile.
- **Spoken Text**:
  > "Hello everyone. Today we are presenting **CashFlow Guardian AI**.
  > 
  > Most small business owners and freelancers don’t fail because they aren't working hard — they fail because of unexpected cash flow timing collisions. You might feel safe looking at your account today, but an uncollected invoice combined with fixed rent can create a sudden overdraft in two weeks."

**[0:20 – 0:45] Screen: Point to Dashboard KPI Cards and Model Status Banner**
- **Action**: Mouse hover over **Liquid Balance (₹8,500)**, **Operating Runway (~12 Days)**, and **Cash Safety Score (22/100)**.
- **Spoken Text**:
  > "Here on our live dashboard, our user has an opening balance of ₹8,500. Notice our top model status bar: our trained **Random Forest Classifier** is actively connected via FastAPI, evaluating 12 financial features in real-time.
  > 
  > Instead of just recording old expenses, the system computes an algorithmic **Cash Safety Score of 22 out of 100**, signaling critical liquidity distress."

---

### Phase 2: Cash Shortage Prediction & Explainability [0:45 – 1:40]

**[0:45 – 1:15] Screen: Highlight Shortage Alert & 30-Day Trajectory Chart**
- **Action**: Scroll down slightly to show the **Shortage Alert Banner** and the **Rolling 30-Day Trajectory Chart**.
- **Spoken Text**:
  > "Look at the red alert banner: the model predicts a **97.5% shortage probability**, identifying that the account will cross below the ₹15,000 safe cushion in approximately **12 days**.
  > 
  > On the 30-day forecast chart, you can clearly see the green trajectory dipping below the red dotted safe buffer line as scheduled liabilities hit before invoice settlements clear."

**[1:15 – 1:40] Screen: Show "Why this prediction?" and click "Model Details"**
- **Action**: Scroll to the **Why this prediction?** cards, then click the **"Model Details"** button in the top banner to open the transparency modal.
- **Spoken Text**:
  > "A prediction is only useful if you understand why. Under *Why this prediction?*, our system pinpoints the exact drivers: ₹28,500 in overdue invoice receivables colliding with ₹37,000 in upcoming rent and payroll.
  > 
  > When we click **Model Details**, we see full technical transparency: our model achieved **98.1% accuracy** and a **0.998 ROC-AUC** across 5,000 training records, using 12 domain features."
- **Action**: Close the modal by clicking the Close button.

---

### Phase 3: What-If Stress Simulator [1:40 – 2:15]

**[1:40 – 2:15] Screen: Navigate to "What-If Simulator" tab**
- **Action**: Click the **What-If Simulator** navigation tab. Click the **"+₹25k Emergency Funding"** preset or adjust the **Emergency Funding** slider.
- **Spoken Text**:
  > "Now, let’s explore the most powerful capability of CashFlow Guardian: the **What-If Stress Simulator**.
  > 
  > An operator can test financial decisions before committing capital. Let’s simulate adding ₹25,000 in short-term bridge financing.
  > 
  > Look at the **Before vs. After** comparison cards: instantly, the simulated shortage risk plummets from **97.5% down to 12%**, our Safety Score increases by **+38 points**, and the dual-line chart shows our simulated green line staying safely above the red buffer."

---

### Phase 4: Action Engine & 1-Click Remediation [2:15 – 2:40]

**[2:15 – 2:40] Screen: Navigate to "AI Insights" page**
- **Action**: Click the **AI Insights** tab. Click **"Execute Remedy"** or **"Send Reminder"** on the top critical recommendation card. Confetti animation triggers.
- **Spoken Text**:
  > "Under **AI Insights**, CashFlow Guardian doesn't just diagnose the problem — it prescribes concrete solutions.
  > 
  > Here is our top critical recommendation: send a 1-click payment reminder for the ₹28,500 overdue invoice. 
  > 
  > When we execute this remedy, the system applies the recovery, logs the action, and dynamically recalculates our cash flow runway."

---

### Phase 5: Demo Scenario Switcher & Summary [2:40 – 3:00]

**[2:40 – 3:00] Screen: Switch Demo Profile to "Stable Growth"**
- **Action**: Click the **Dashboard** tab and click the **"Stable Growth"** scenario button.
- **Spoken Text**:
  > "Finally, we can toggle between different business profiles like **Stable Growth** or **Payment Pressure**. In Stable Growth, our liquid balance is healthy at ₹98,000, shortage risk is just 3.5%, and the safety score is 99/100.
  > 
  > In conclusion, CashFlow Guardian AI replaces financial guesswork with predictive intelligence: **Predict, Explain, Simulate, and Act**.
  > 
  > Thank you, and we look forward to your questions!"
