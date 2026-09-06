"""
Generates ml/samples/user_data.json: the single canonical demo dataset shared by
the ML engine, apps/backend and apps/goals-frontend.

Produces 12 months of realistic Indian household transactions (recurring bills with
small month-to-month variance, occasional festival/seasonal spikes, and a couple of
one-off big-ticket events) instead of the single sparse month this used to contain —
more history gives the forecaster/behavioral-analysis/anomaly-detection code real
signal to work with. Income, assets, liabilities and goals are left as the existing,
already-consistent figures (also mirrored by apps/goals-frontend/src/data/profiles.ts).

Deterministic (fixed random seed) so re-running this produces the same file.
Run with: ml/venv/bin/python ml/samples/generate_sample.py
"""
import json
import random
from datetime import date

random.seed(20260904)

# (year, month) for Sep 2025 .. Aug 2026 inclusive — the 12 months ending "now".
MONTHS = [(2025, m) for m in range(9, 13)] + [(2026, m) for m in range(1, 9)]


def jittered(base: float, pct: float) -> int:
    """Round-trip through int to keep amounts looking like real rupee figures."""
    return int(round(base * (1 + random.uniform(-pct, pct))))


def day(year: int, month: int, dom: int) -> str:
    return date(year, month, dom).isoformat()


def build_month(year: int, month: int, month_index: int) -> list:
    """month_index: 0 = Sep 2025 .. 11 = Aug 2026, used for seasonal/festival effects."""
    is_summer = month in (4, 5, 6)  # higher electricity for AC
    is_festival = month in (10, 11)  # Diwali season — more shopping/dining
    is_winter = month in (12, 1)

    txns = [
        # ---- Tier A: Non-negotiable ----
        {"amount": 42000, "category": "Tier_A_NonNegotiable", "date": day(year, month, 1),
         "description": "Home loan EMI", "tier": "Tier_A_NonNegotiable", "merchant": "HDFC Bank"},
        {"amount": 8500, "category": "Tier_A_NonNegotiable", "date": day(year, month, 3),
         "description": "LIC premium payment", "tier": "Tier_A_NonNegotiable", "merchant": "LIC of India"},
        {"amount": jittered(2400, 0.10), "category": "Tier_A_NonNegotiable", "date": day(year, month, 5),
         "description": "Water and maintenance charges", "tier": "Tier_A_NonNegotiable", "merchant": "Prestige Society"},

        # ---- Tier B: Optimizable ----
        {"amount": jittered(5200, 0.15), "category": "Tier_B_Optimizable", "date": day(year, month, 6),
         "description": "Monthly grocery shopping", "tier": "Tier_B_Optimizable", "merchant": "BigBasket"},
        {"amount": 1199 if month_index >= 6 else 1200, "category": "Tier_B_Optimizable", "date": day(year, month, 2),
         "description": "Broadband internet bill", "tier": "Tier_B_Optimizable", "merchant": "ACT Fibernet"},
        {"amount": jittered(2900 if is_summer else 1900, 0.12), "category": "Tier_B_Optimizable", "date": day(year, month, 8),
         "description": "Electricity bill", "tier": "Tier_B_Optimizable", "merchant": "BESCOM"},
        {"amount": jittered(3000, 0.20), "category": "Tier_B_Optimizable", "date": day(year, month, 10),
         "description": "Fuel and cab rides", "tier": "Tier_B_Optimizable", "merchant": "Uber"},

        # ---- Tier C: Flexible ----
        {"amount": jittered(3400 if is_festival else 2800, 0.20), "category": "Tier_C_Flexible", "date": day(year, month, 12),
         "description": "Dinner with friends", "tier": "Tier_C_Flexible", "merchant": "Barbeque Nation"},
        {"amount": jittered(9500 if is_festival else 6500, 0.20), "category": "Tier_C_Flexible", "date": day(year, month, 14),
         "description": "Clothing purchase", "tier": "Tier_C_Flexible", "merchant": "Myntra"},
        {"amount": 1499, "category": "Tier_C_Flexible", "date": day(year, month, 1),
         "description": "OTT subscription bundle", "tier": "Tier_C_Flexible", "merchant": "Netflix"},

        # ---- Tier D: Leakage ----
        {"amount": 499, "category": "Tier_D_Leakage", "date": day(year, month, 1),
         "description": "Unused fitness app subscription", "tier": "Tier_D_Leakage", "merchant": "Cult.fit"},
    ]

    # Impulse electronics purchase — occasional, not every month (~60% of months).
    if random.random() < 0.6:
        txns.append({
            "amount": jittered(2200, 0.35), "category": "Tier_D_Leakage", "date": day(year, month, 16),
            "description": "Impulse electronics purchase", "tier": "Tier_D_Leakage", "merchant": "Amazon",
        })

    # One-off seasonal/annual events layered on top of the recurring baseline.
    if month == 6:  # Annual health + vehicle insurance renewal (June)
        txns.append({
            "amount": 24000, "category": "Tier_A_NonNegotiable", "date": day(year, month, 20),
            "description": "Health insurance annual renewal", "tier": "Tier_A_NonNegotiable", "merchant": "Star Health",
        })
    if month == 11:  # Diwali gifting/shopping spike
        txns.append({
            "amount": jittered(7500, 0.15), "category": "Tier_C_Flexible", "date": day(year, month, 9),
            "description": "Diwali gifts and decor", "tier": "Tier_C_Flexible", "merchant": "Amazon",
        })
    if month == 5:  # Summer family trip
        txns.append({
            "amount": 32000, "category": "Tier_C_Flexible", "date": day(year, month, 22),
            "description": "Family weekend trip to Coorg", "tier": "Tier_C_Flexible", "merchant": "MakeMyTrip",
        })
    if month == 3:  # Annual health checkup, common before FY close
        txns.append({
            "amount": 4200, "category": "Tier_B_Optimizable", "date": day(year, month, 18),
            "description": "Annual health checkup", "tier": "Tier_B_Optimizable", "merchant": "Apollo Diagnostics",
        })
    if is_winter:  # Heavier winter online shopping (sales season)
        txns.append({
            "amount": jittered(3600, 0.20), "category": "Tier_C_Flexible", "date": day(year, month, 26),
            "description": "Year-end sale shopping", "tier": "Tier_C_Flexible", "merchant": "Flipkart",
        })

    return txns


def build_transactions() -> list:
    all_txns = []
    for idx, (year, month) in enumerate(MONTHS):
        all_txns.extend(build_month(year, month, idx))
    return sorted(all_txns, key=lambda t: t["date"])


def main():
    with open("ml/samples/user_data.json") as f:
        data = json.load(f)

    data["transactions"] = build_transactions()

    with open("ml/samples/user_data.json", "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"Wrote {len(data['transactions'])} transactions across {len(MONTHS)} months "
          f"to ml/samples/user_data.json")


if __name__ == "__main__":
    main()
