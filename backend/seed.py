import asyncio
from lib.db import db
from datetime import datetime, timezone
import uuid

def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

INITIAL_DEALS = [
    {
        "id": str(uuid.uuid4()),
        "name": "Apex Cloud Security Acquisition",
        "target_company": "ApexSecure Technologies Inc.",
        "sector": "SaaS / Cybersecurity",
        "deal_type": "100% Buyout",
        "stage": "Due Diligence",
        "enterprise_value": 48.5,
        "revenue": 14.2,
        "ebitda": 4.2,
        "ebitda_multiple": 11.5,
        "lead_partner": "Marcus Vance",
        "probability_pct": 75,
        "cash_required": 34.0,
        "target_close_date": "2025-08-30",
        "notes": "Leading Zero-Trust identity platform with 128% Net Revenue Retention. QoE audit underway with EY.",
        "created_at": utc_now_iso(),
        "updated_at": utc_now_iso()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "NexaPay Embedded Core Buyout",
        "target_company": "NexaPay Solutions Corp",
        "sector": "FinTech / Payments",
        "deal_type": "Majority Acquisition (80%)",
        "stage": "LOI / Exclusivity",
        "enterprise_value": 85.0,
        "revenue": 28.0,
        "ebitda": 8.5,
        "ebitda_multiple": 10.0,
        "lead_partner": "Sarah Chen",
        "probability_pct": 65,
        "cash_required": 55.0,
        "target_close_date": "2025-10-15",
        "notes": "Exclusive 45-day window signed. High gross margins (78%), low churn, expanding into LATAM cross-border.",
        "created_at": utc_now_iso(),
        "updated_at": utc_now_iso()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "BioStream AI Diagnostics Growth",
        "target_company": "BioStream Life Sciences",
        "sector": "HealthTech",
        "deal_type": "Growth Equity",
        "stage": "IOI Submitted",
        "enterprise_value": 32.0,
        "revenue": 9.5,
        "ebitda": 2.4,
        "ebitda_multiple": 13.3,
        "lead_partner": "Elena Rostova",
        "probability_pct": 45,
        "cash_required": 16.0,
        "target_close_date": "2025-11-20",
        "notes": "FDA cleared pathology AI diagnostics platform. 3 health system enterprise contracts pending.",
        "created_at": utc_now_iso(),
        "updated_at": utc_now_iso()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "CloudScale DataOps Platform",
        "target_company": "CloudScale Systems",
        "sector": "SaaS / Cloud",
        "deal_type": "100% Buyout",
        "stage": "Definitive Docs",
        "enterprise_value": 115.0,
        "revenue": 36.0,
        "ebitda": 9.6,
        "ebitda_multiple": 12.0,
        "lead_partner": "Marcus Vance",
        "probability_pct": 90,
        "cash_required": 78.0,
        "target_close_date": "2025-07-28",
        "notes": "Final purchase agreement circulating. HSR clearance received. Debt package secured at SOFR+325bps.",
        "created_at": utc_now_iso(),
        "updated_at": utc_now_iso()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Veloce Industrial Robotics",
        "target_company": "Veloce Automation AG",
        "sector": "Industrial IoT",
        "deal_type": "Majority Acquisition (70%)",
        "stage": "Initial Review",
        "enterprise_value": 64.0,
        "revenue": 22.0,
        "ebitda": 5.8,
        "ebitda_multiple": 11.0,
        "lead_partner": "David Kim",
        "probability_pct": 30,
        "cash_required": 42.0,
        "target_close_date": "2025-12-15",
        "notes": "Warehouse automation robotics in DACH region. Reviewing CapEx cycle and supply chain vendor contracts.",
        "created_at": utc_now_iso(),
        "updated_at": utc_now_iso()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "EcoGrid Energy Analytics",
        "target_company": "EcoGrid Analytics Inc.",
        "sector": "CleanTech / Energy",
        "deal_type": "Growth Equity",
        "stage": "CIM Review",
        "enterprise_value": 28.5,
        "revenue": 11.0,
        "ebitda": 2.1,
        "ebitda_multiple": 13.6,
        "lead_partner": "Elena Rostova",
        "probability_pct": 40,
        "cash_required": 14.5,
        "target_close_date": "2025-11-05",
        "notes": "Smart grid distribution optimization software. Strong utility pilot traction.",
        "created_at": utc_now_iso(),
        "updated_at": utc_now_iso()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "OmniReach Marketing Automation",
        "target_company": "OmniReach Media Labs",
        "sector": "MarTech / SaaS",
        "deal_type": "Bolt-On Add-on",
        "stage": "Lead Sourcing",
        "enterprise_value": 19.0,
        "revenue": 7.2,
        "ebitda": 1.9,
        "ebitda_multiple": 10.0,
        "lead_partner": "Sarah Chen",
        "probability_pct": 20,
        "cash_required": 12.0,
        "target_close_date": "2026-01-30",
        "notes": "Potential synergistic add-on to existing portfolio company MediaHub. Initial broker outreach completed.",
        "created_at": utc_now_iso(),
        "updated_at": utc_now_iso()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Hyperion Aerospace Subsystems",
        "target_company": "Hyperion Dynamics",
        "sector": "Defense & Aerospace",
        "deal_type": "100% Buyout",
        "stage": "Closed Won",
        "enterprise_value": 52.0,
        "revenue": 18.5,
        "ebitda": 5.2,
        "ebitda_multiple": 10.0,
        "lead_partner": "Marcus Vance",
        "probability_pct": 100,
        "cash_required": 38.0,
        "target_close_date": "2025-05-15",
        "notes": "Closed and funded in Q2. 100-day value creation plan in motion.",
        "created_at": utc_now_iso(),
        "updated_at": utc_now_iso()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "MedSync EHR Gateway",
        "target_company": "MedSync Software LLC",
        "sector": "HealthTech",
        "deal_type": "Bolt-On Add-on",
        "stage": "NDA Signed",
        "enterprise_value": 14.5,
        "revenue": 5.0,
        "ebitda": 1.2,
        "ebitda_multiple": 12.1,
        "lead_partner": "David Kim",
        "probability_pct": 35,
        "cash_required": 9.5,
        "target_close_date": "2025-11-30",
        "notes": "Teaser reviewed, NDA signed. Awaiting management presentation and data room access.",
        "created_at": utc_now_iso(),
        "updated_at": utc_now_iso()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "NovaWave Telemetry Systems",
        "target_company": "NovaWave Technologies",
        "sector": "Industrial IoT",
        "deal_type": "100% Buyout",
        "stage": "Passed",
        "enterprise_value": 9.8,
        "revenue": 3.5,
        "ebitda": 0.8,
        "ebitda_multiple": 12.3,
        "lead_partner": "Elena Rostova",
        "probability_pct": 0,
        "cash_required": 7.0,
        "target_close_date": "2025-04-10",
        "notes": "Passed after technical audit showed significant legacy tech debt and customer concentration.",
        "created_at": utc_now_iso(),
        "updated_at": utc_now_iso()
    }
]

INITIAL_ADJUSTMENTS = [
    {
        "id": str(uuid.uuid4()),
        "deal_id": None,
        "name": "Founder / Owner Compensation Normalization",
        "category": "Owner Compensation",
        "amount": 0.45,
        "adjustment_type": "add_back",
        "notes": "Current owner takes $750k salary. Normalized replacement CEO/executive package estimated at $300k ($450k add-back).",
        "created_at": utc_now_iso()
    },
    {
        "id": str(uuid.uuid4()),
        "deal_id": None,
        "name": "Non-Recurring Carve-Out Legal & Audit Fees",
        "category": "One-Time Legal/Advisory",
        "amount": 0.32,
        "adjustment_type": "add_back",
        "notes": "One-off legal and advisory expenditures related to corporate spin-off in prior fiscal year.",
        "created_at": utc_now_iso()
    },
    {
        "id": str(uuid.uuid4()),
        "deal_id": None,
        "name": "Legacy Data Center to AWS Dual-Run Overlap",
        "category": "IT & Cloud Migration",
        "amount": 0.28,
        "adjustment_type": "add_back",
        "notes": "Temporary infrastructure cost incurred during 8-month cloud migration completed in Q1.",
        "created_at": utc_now_iso()
    },
    {
        "id": str(uuid.uuid4()),
        "deal_id": None,
        "name": "Restructuring & Severance Expenses",
        "category": "Restructuring & Severance",
        "amount": 0.19,
        "adjustment_type": "add_back",
        "notes": "One-time severance payments associated with head-count rationalization in non-core division.",
        "created_at": utc_now_iso()
    },
    {
        "id": str(uuid.uuid4()),
        "deal_id": None,
        "name": "Non-Operating Real Estate Sublease Income",
        "category": "Non-Operating Income",
        "amount": 0.12,
        "adjustment_type": "deduction",
        "notes": "Sublease income from vacant warehouse not transferring with operating assets.",
        "created_at": utc_now_iso()
    },
    {
        "id": str(uuid.uuid4()),
        "deal_id": None,
        "name": "Procurement & SaaS License Synergies",
        "category": "Pro-Forma Synergies",
        "amount": 0.60,
        "adjustment_type": "add_back",
        "notes": "Identified post-close vendor consolidation and master agreement discounts across combined portfolio.",
        "created_at": utc_now_iso()
    }
]

async def run_seed():
    # Clear existing
    await db.deals.delete_many({})
    await db.ebitda_adjustments.delete_many({})
    
    # Insert new
    await db.deals.insert_many(INITIAL_DEALS)
    await db.ebitda_adjustments.insert_many(INITIAL_ADJUSTMENTS)
    print(f"Seeded {len(INITIAL_DEALS)} deals and {len(INITIAL_ADJUSTMENTS)} EBITDA adjustments.")

if __name__ == "__main__":
    asyncio.run(run_seed())
