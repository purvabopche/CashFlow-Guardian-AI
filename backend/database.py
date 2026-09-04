import os
import sqlite3
import json
import datetime
from typing import Dict, Any, List, Optional
try:
    from backend.data.demo_scenarios import get_demo_scenarios
except (ImportError, ValueError):
    try:
        from data.demo_scenarios import get_demo_scenarios
    except (ImportError, ValueError):
        from .data.demo_scenarios import get_demo_scenarios

DB_FILE = os.environ.get("DATABASE_URL", "cashflow_guardian.db").replace("sqlite:///", "").replace("sqlite://", "")
if not DB_FILE:
    DB_FILE = "cashflow_guardian.db"

# Handle Vercel serverless read-only filesystem environment
if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME") or not os.access(".", os.W_OK):
    tmp_db = os.path.join("/tmp", "cashflow_guardian.db")
    if not os.path.exists(tmp_db) and os.path.exists(DB_FILE):
        import shutil
        try:
            shutil.copy2(DB_FILE, tmp_db)
        except Exception:
            pass
    DB_FILE = tmp_db

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Scenarios table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scenarios (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        industry TEXT NOT NULL,
        description TEXT NOT NULL,
        current_balance REAL NOT NULL,
        monthly_inflow REAL NOT NULL,
        monthly_outflow REAL NOT NULL,
        safe_buffer_threshold REAL NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Transactions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        scenario_id TEXT NOT NULL,
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        is_recurring INTEGER DEFAULT 0,
        is_discretionary INTEGER DEFAULT 0,
        merchant TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scenario_id) REFERENCES scenarios (id)
    );
    """)

    # 3. Invoices table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        scenario_id TEXT NOT NULL,
        client TEXT NOT NULL,
        amount REAL NOT NULL,
        due_date TEXT NOT NULL,
        status TEXT NOT NULL,
        days_overdue INTEGER DEFAULT 0,
        probability_of_delay REAL DEFAULT 0.0,
        expected_delay_days INTEGER DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scenario_id) REFERENCES scenarios (id)
    );
    """)

    # 4. Payments table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        scenario_id TEXT NOT NULL,
        counterparty TEXT NOT NULL,
        vendor TEXT NOT NULL,
        description TEXT,
        amount REAL NOT NULL,
        direction TEXT DEFAULT 'outgoing',
        scheduled_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        category TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        is_flexible INTEGER DEFAULT 0,
        is_recurring INTEGER DEFAULT 0,
        urgency TEXT DEFAULT 'Medium',
        notes TEXT,
        provider TEXT DEFAULT 'demo',
        reference_id TEXT,
        transaction_id TEXT,
        invoice_reference TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TEXT,
        FOREIGN KEY (scenario_id) REFERENCES scenarios (id)
    );
    """)

    # 5. Webhook Events table (Idempotency)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS webhook_events (
        event_id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        payment_id TEXT,
        payload TEXT NOT NULL,
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()

    # Seed initial datasets if empty
    cursor.execute("SELECT COUNT(*) as cnt FROM scenarios;")
    row = cursor.fetchone()
    if row["cnt"] == 0:
        seed_data(conn)

    conn.close()

def seed_data(conn):
    demo = get_demo_scenarios()
    cursor = conn.cursor()

    for s_id, s in demo.items():
        cursor.execute("""
        INSERT OR IGNORE INTO scenarios (id, name, industry, description, current_balance, monthly_inflow, monthly_outflow, safe_buffer_threshold)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            s["id"], s["name"], s["industry"], s["description"],
            s["current_balance"], s["monthly_inflow"], s["monthly_outflow"], s["safe_buffer_threshold"]
        ))

        for tx in s.get("transactions", []):
            cursor.execute("""
            INSERT OR IGNORE INTO transactions (id, scenario_id, date, title, category, type, amount, is_recurring, is_discretionary, merchant, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                tx["id"], s_id, tx.get("date", "2026-08-25"), tx["title"], tx.get("category", "General"),
                tx["type"], tx["amount"], 1 if tx.get("isRecurring") else 0, 1 if tx.get("isDiscretionary") else 0,
                tx.get("merchant", ""), tx.get("notes", "")
            ))

        for inv in s.get("invoices", []):
            cursor.execute("""
            INSERT OR IGNORE INTO invoices (id, scenario_id, client, amount, due_date, status, days_overdue, probability_of_delay, expected_delay_days, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                inv["id"], s_id, inv.get("client", "Client"), inv["amount"], inv.get("dueDate") or inv.get("due_date", "2026-09-01"), inv["status"],
                inv.get("daysOverdue") or inv.get("days_overdue", 0), inv.get("probabilityOfDelay") or inv.get("probability_of_delay", 0.0),
                inv.get("expectedDelayDays") or inv.get("expected_delay_days", 0), inv.get("description", "")
            ))

        for p in s.get("payments", []):
            cp = p.get("counterparty") or p.get("vendor", "Payee")
            cursor.execute("""
            INSERT OR IGNORE INTO payments (id, scenario_id, counterparty, vendor, description, amount, direction, scheduled_date, due_date, category, status, is_flexible, is_recurring, urgency, notes, provider, reference_id, transaction_id, invoice_reference, processed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                p["id"], s_id, cp, p.get("vendor", cp), p.get("description", p.get("notes", "")),
                p["amount"], p.get("direction", "outgoing"), p.get("scheduledDate") or p.get("scheduled_date") or p.get("dueDate") or p.get("due_date", "2026-09-01"),
                p.get("dueDate") or p.get("due_date", "2026-09-01"), p.get("category", "Vendor"), p.get("status", "pending"),
                1 if (p.get("isFlexible") or p.get("is_flexible")) else 0, 1 if (p.get("isRecurring") or p.get("is_recurring")) else 0, p.get("urgency", "Medium"),
                p.get("notes", ""), p.get("provider", "demo"), p.get("referenceId") or p.get("reference_id"), p.get("transactionId") or p.get("transaction_id"),
                p.get("invoiceReference") or p.get("invoice_reference"), p.get("processedAt") or p.get("processed_at")
            ))

    conn.commit()

def db_reset_demo_baseline(scenario_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Safely resets database tables (or specific scenario) back to baseline demo dataset profiles.
    Clears test payment/transaction artifacts while preserving full database structure and logic.
    """
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    if scenario_id:
        cursor.execute("DELETE FROM transactions WHERE scenario_id = ?;", (scenario_id,))
        cursor.execute("DELETE FROM payments WHERE scenario_id = ?;", (scenario_id,))
        cursor.execute("DELETE FROM invoices WHERE scenario_id = ?;", (scenario_id,))
        cursor.execute("DELETE FROM scenarios WHERE id = ?;", (scenario_id,))
    else:
        cursor.execute("DELETE FROM transactions;")
        cursor.execute("DELETE FROM payments;")
        cursor.execute("DELETE FROM invoices;")
        cursor.execute("DELETE FROM scenarios;")
        cursor.execute("DELETE FROM webhook_events;")

    conn.commit()

    # Re-seed baseline demo profiles
    demo = get_demo_scenarios()
    target_scenarios = {scenario_id: demo[scenario_id]} if scenario_id and scenario_id in demo else demo

    for s_id, s in target_scenarios.items():
        cursor.execute("""
        INSERT OR REPLACE INTO scenarios (id, name, industry, description, current_balance, monthly_inflow, monthly_outflow, safe_buffer_threshold)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            s["id"], s["name"], s["industry"], s["description"],
            s["current_balance"], s["monthly_inflow"], s["monthly_outflow"], s["safe_buffer_threshold"]
        ))

        for tx in s.get("transactions", []):
            cursor.execute("""
            INSERT OR REPLACE INTO transactions (id, scenario_id, date, title, category, type, amount, is_recurring, is_discretionary, merchant, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                tx["id"], s_id, tx.get("date", "2026-08-25"), tx["title"], tx.get("category", "General"),
                tx["type"], tx["amount"], 1 if tx.get("isRecurring") else 0, 1 if tx.get("isDiscretionary") else 0,
                tx.get("merchant", ""), tx.get("notes", "")
            ))

        for inv in s.get("invoices", []):
            cursor.execute("""
            INSERT OR REPLACE INTO invoices (id, scenario_id, client, amount, due_date, status, days_overdue, probability_of_delay, expected_delay_days, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                inv["id"], s_id, inv.get("client", "Client"), inv["amount"], inv.get("dueDate") or inv.get("due_date", "2026-09-01"), inv["status"],
                inv.get("daysOverdue") or inv.get("days_overdue", 0), inv.get("probabilityOfDelay") or inv.get("probability_of_delay", 0.0),
                inv.get("expectedDelayDays") or inv.get("expected_delay_days", 0), inv.get("description", "")
            ))

        for p in s.get("payments", []):
            cp = p.get("counterparty") or p.get("vendor", "Payee")
            cursor.execute("""
            INSERT OR REPLACE INTO payments (id, scenario_id, counterparty, vendor, description, amount, direction, scheduled_date, due_date, category, status, is_flexible, is_recurring, urgency, notes, provider, reference_id, transaction_id, invoice_reference, processed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                p["id"], s_id, cp, p.get("vendor", cp), p.get("description", p.get("notes", "")),
                p["amount"], p.get("direction", "outgoing"), p.get("scheduledDate") or p.get("scheduled_date") or p.get("dueDate") or p.get("due_date", "2026-09-01"),
                p.get("dueDate") or p.get("due_date", "2026-09-01"), p.get("category", "Vendor"), p.get("status", "pending"),
                1 if (p.get("isFlexible") or p.get("is_flexible")) else 0, 1 if (p.get("isRecurring") or p.get("is_recurring")) else 0, p.get("urgency", "Medium"),
                p.get("notes", ""), p.get("provider", "demo"), p.get("referenceId") or p.get("reference_id"), p.get("transactionId") or p.get("transaction_id"),
                p.get("invoiceReference") or p.get("invoice_reference"), p.get("processedAt") or p.get("processed_at")
            ))

    conn.commit()
    conn.close()
    return get_scenario_dict(scenario_id or "critical_shortage")

def get_scenario_dict(scenario_id: str = "critical_shortage") -> Dict[str, Any]:
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM scenarios WHERE id = ?;", (scenario_id,))
    s_row = cursor.fetchone()
    if not s_row:
        cursor.execute("SELECT * FROM scenarios WHERE id = 'critical_shortage';")
        s_row = cursor.fetchone()

    s_dict = dict(s_row)

    # Fetch transactions
    cursor.execute("SELECT * FROM transactions WHERE scenario_id = ? ORDER BY date DESC;", (s_dict["id"],))
    tx_rows = cursor.fetchall()
    tx_list = []
    for r in tx_rows:
        tx_dict = dict(r)
        tx_dict["isRecurring"] = bool(r["is_recurring"])
        tx_dict["isDiscretionary"] = bool(r["is_discretionary"])
        tx_list.append(tx_dict)

    # Fetch invoices
    cursor.execute("SELECT * FROM invoices WHERE scenario_id = ? ORDER BY due_date ASC;", (s_dict["id"],))
    inv_rows = cursor.fetchall()
    inv_list = []
    for r in inv_rows:
        inv_dict = dict(r)
        inv_dict["dueDate"] = r["due_date"]
        inv_dict["daysOverdue"] = r["days_overdue"]
        inv_dict["probabilityOfDelay"] = r["probability_of_delay"]
        inv_dict["expectedDelayDays"] = r["expected_delay_days"]
        inv_list.append(inv_dict)

    # Fetch payments
    cursor.execute("SELECT * FROM payments WHERE scenario_id = ? ORDER BY scheduled_date ASC;", (s_dict["id"],))
    pay_rows = cursor.fetchall()
    pay_list = []
    for r in pay_rows:
        p_dict = dict(r)
        p_dict["scheduledDate"] = r["scheduled_date"]
        p_dict["dueDate"] = r["due_date"]
        p_dict["isFlexible"] = bool(r["is_flexible"])
        p_dict["isRecurring"] = bool(r["is_recurring"])
        p_dict["referenceId"] = r["reference_id"]
        p_dict["transactionId"] = r["transaction_id"]
        p_dict["invoiceReference"] = r["invoice_reference"]
        p_dict["processedAt"] = r["processed_at"]
        pay_list.append(p_dict)

    s_dict["transactions"] = tx_list
    s_dict["invoices"] = inv_list
    s_dict["payments"] = pay_list
    s_dict["currentBalance"] = s_dict["current_balance"]
    s_dict["monthlyInflow"] = s_dict["monthly_inflow"]
    s_dict["monthlyOutflow"] = s_dict["monthly_outflow"]
    s_dict["safeBufferThreshold"] = s_dict["safe_buffer_threshold"]

    conn.close()
    return s_dict

def db_add_transaction(scenario_id: str, tx: Dict[str, Any]) -> Dict[str, Any]:
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    tx_id = tx.get("id") or f"tx-{int(datetime.datetime.now().timestamp())}"
    date_str = tx.get("date") or datetime.date.today().isoformat()
    amount = float(tx.get("amount", 0.0))
    tx_type = tx.get("type", "expense")

    cursor.execute("""
    INSERT INTO transactions (id, scenario_id, date, title, category, type, amount, is_recurring, is_discretionary, merchant, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        tx_id, scenario_id, date_str, tx["title"], tx.get("category", "General"),
        tx_type, amount, 1 if tx.get("isRecurring") else 0, 1 if tx.get("isDiscretionary") else 0,
        tx.get("merchant", ""), tx.get("notes", "")
    ))

    # Update scenario balance
    if tx_type == "income":
        cursor.execute("UPDATE scenarios SET current_balance = current_balance + ? WHERE id = ?;", (amount, scenario_id))
    else:
        cursor.execute("UPDATE scenarios SET current_balance = MAX(0.0, current_balance - ?) WHERE id = ?;", (amount, scenario_id))

    conn.commit()

    cursor.execute("SELECT current_balance FROM scenarios WHERE id = ?;", (scenario_id,))
    new_bal = cursor.fetchone()["current_balance"]

    conn.close()
    return {"id": tx_id, "new_balance": new_bal}

def db_delete_transaction(scenario_id: str, tx_id: str) -> Dict[str, Any]:
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT amount, type FROM transactions WHERE id = ? AND scenario_id = ?;", (tx_id, scenario_id))
    row = cursor.fetchone()
    if row:
        amt = float(row["amount"])
        tx_type = row["type"]
        if tx_type == "income":
            cursor.execute("UPDATE scenarios SET current_balance = MAX(0.0, current_balance - ?) WHERE id = ?;", (amt, scenario_id))
        else:
            cursor.execute("UPDATE scenarios SET current_balance = current_balance + ? WHERE id = ?;", (amt, scenario_id))

        cursor.execute("DELETE FROM transactions WHERE id = ? AND scenario_id = ?;", (tx_id, scenario_id))
        conn.commit()

    cursor.execute("SELECT current_balance FROM scenarios WHERE id = ?;", (scenario_id,))
    new_bal_row = cursor.fetchone()
    new_bal = new_bal_row["current_balance"] if new_bal_row else 0.0

    conn.close()
    return {"id": tx_id, "new_balance": new_bal}

def db_update_payment_status(scenario_id: str, payment_id: str, status: str, ref_id: Optional[str] = None, tx_id: Optional[str] = None) -> Dict[str, Any]:
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    processed_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Fetch payment details to create corresponding transaction if not already present
    cursor.execute("SELECT * FROM payments WHERE id = ? AND scenario_id = ?;", (payment_id, scenario_id))
    pmt_row = cursor.fetchone()

    tx_created_id = tx_id
    if pmt_row and status == "paid":
        tx_created_id = tx_id or f"tx-pay-{payment_id}"
        cursor.execute("SELECT COUNT(*) as cnt FROM transactions WHERE id = ?;", (tx_created_id,))
        if cursor.fetchone()["cnt"] == 0:
            c_name = pmt_row["counterparty"] or pmt_row["vendor"] or "Counterparty"
            is_inc = pmt_row["direction"] == "incoming"
            tx_type = "income" if is_inc else "expense"
            amt = float(pmt_row["amount"])
            date_today = datetime.date.today().isoformat()

            cursor.execute("""
            INSERT OR IGNORE INTO transactions (id, scenario_id, date, title, category, type, amount, is_recurring, is_discretionary, merchant, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?);
            """, (
                tx_created_id, scenario_id, date_today, f"Payment: {c_name}",
                pmt_row["category"] or "General", tx_type, amt,
                pmt_row["is_recurring"], c_name, f"Settled via Razorpay Test Mode [Ref: {ref_id}]"
            ))

            # Update scenario balance
            if is_inc:
                cursor.execute("UPDATE scenarios SET current_balance = current_balance + ? WHERE id = ?;", (amt, scenario_id))
            else:
                cursor.execute("UPDATE scenarios SET current_balance = MAX(0.0, current_balance - ?) WHERE id = ?;", (amt, scenario_id))

            # If payment linked to invoice, mark invoice paid
            if pmt_row["invoice_reference"]:
                cursor.execute("UPDATE invoices SET status = 'paid' WHERE id = ? AND scenario_id = ?;", (pmt_row["invoice_reference"], scenario_id))

    cursor.execute("""
    UPDATE payments
    SET status = ?, reference_id = COALESCE(?, reference_id), transaction_id = COALESCE(?, transaction_id), processed_at = ?
    WHERE id = ? AND scenario_id = ?;
    """, (status, ref_id, tx_created_id, processed_at, payment_id, scenario_id))

    cursor.execute("SELECT * FROM payments WHERE id = ? AND scenario_id = ?;", (payment_id, scenario_id))
    row = cursor.fetchone()
    conn.commit()
    conn.close()

    return dict(row) if row else {}

def db_create_payment(scenario_id: str, req_data: Dict[str, Any]) -> Dict[str, Any]:
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    import uuid
    p_id = f"PAY-{datetime.datetime.now().strftime('%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    counterparty = req_data.get("counterparty") or req_data.get("vendor", "Counterparty")
    sched_date = req_data.get("scheduled_date") or req_data.get("scheduledDate") or datetime.date.today().isoformat()

    cursor.execute("""
    INSERT INTO payments (id, scenario_id, counterparty, vendor, description, amount, direction, scheduled_date, due_date, category, status, is_flexible, is_recurring, urgency, notes, provider, invoice_reference, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, 'demo', ?, ?);
    """, (
        p_id, scenario_id, counterparty, counterparty, req_data.get("description", ""),
        float(req_data.get("amount", 0.0)), req_data.get("direction", "outgoing"),
        sched_date, sched_date, req_data.get("category", "Vendor"),
        1 if req_data.get("is_flexible") else 0, 1 if req_data.get("is_recurring") else 0,
        req_data.get("urgency", "Medium"), req_data.get("notes", ""),
        req_data.get("invoice_reference"), now_str
    ))

    conn.commit()
    cursor.execute("SELECT * FROM payments WHERE id = ?;", (p_id,))
    row = cursor.fetchone()
    conn.close()

    p_dict = dict(row)
    p_dict["scheduled_date"] = p_dict["scheduled_date"]
    p_dict["due_date"] = p_dict["due_date"]
    p_dict["is_flexible"] = bool(p_dict["is_flexible"])
    p_dict["is_recurring"] = bool(p_dict["is_recurring"])
    p_dict["invoice_reference"] = p_dict["invoice_reference"]
    return p_dict

def db_record_webhook_event(event_id: str, event_type: str, payment_id: Optional[str], payload: str) -> bool:
    """Returns True if event is NEW and recorded. Returns False if already processed (Idempotency)."""
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT event_id FROM webhook_events WHERE event_id = ?;", (event_id,))
    if cursor.fetchone():
        conn.close()
        return False  # Already processed

    cursor.execute("""
    INSERT INTO webhook_events (event_id, event_type, payment_id, payload)
    VALUES (?, ?, ?, ?);
    """, (event_id, event_type, payment_id, payload))

    conn.commit()
    conn.close()
    return True
