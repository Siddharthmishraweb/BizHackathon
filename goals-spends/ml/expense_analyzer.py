"""
Expense Intelligence Engine
Analyzes transactions and provides intelligent insights about spending patterns
"""
from typing import List, Dict, Tuple, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from collections import defaultdict
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from config import config
from utils import SpendingAnalysis, FinancialMetrics


class ExpenseAnalyzer:
    """Main expense analysis engine"""
    
    def __init__(self):
        self.category_classifier = None
        self.tier_classifier = None
        self.category_encoder = LabelEncoder()
        self.tier_encoder = LabelEncoder()
    
    def analyze_transactions(self, transactions: List[Dict]) -> Dict:
        """Comprehensive analysis of transactions"""
        df = pd.DataFrame(transactions)
        
        if len(df) == 0:
            return {
                "total_transactions": 0,
                "total_spending": 0.0,
                "daily_average": 0.0,
                "monthly_average": 0.0,
                "spending_distribution": {},
                "recurring_transactions": [],
                "anomalies": [],
                "confidence": 0.0,
            }
        
        # Convert date column
        df['date'] = pd.to_datetime(df['date'])
        
        # Basic statistics
        date_range = (df['date'].max() - df['date'].min()).days
        
        analysis = {
            "total_transactions": len(df),
            "total_spending": float(df['amount'].sum()),
            "average_transaction": float(df['amount'].mean()),
            "median_transaction": float(df['amount'].median()),
            "max_transaction": float(df['amount'].max()),
            "min_transaction": float(df['amount'].min()),
            "std_transaction": float(df['amount'].std()),
            "daily_average": float(df['amount'].sum() / (date_range + 1) if date_range > 0 else 0),
            "monthly_average": float(df['amount'].sum() / ((date_range + 1) / 30)),
            "spending_by_tier": self._analyze_by_tier(df),
            "spending_by_category": self._analyze_by_category(df),
            "spending_by_merchant": self._analyze_by_merchant(df),
            "temporal_patterns": self._analyze_temporal_patterns(df),
            "recurring_transactions": SpendingAnalysis.detect_recurring_transactions(transactions),
            "anomalies": self._detect_anomalies(df),
            "leakage_opportunities": self._detect_leakage(df),
            "data_quality_confidence": self._estimate_confidence(df),
        }
        
        return analysis
    
    def train_and_predict_category(self, historical_transactions: List[Dict], new_transaction: Dict) -> Dict:
        """Train a RandomForest on this user's OWN labeled transaction history (personalized,
        not a generic model) and predict the tier/category of a new, unlabeled transaction.
        Falls back to a rule-based heuristic when there isn't enough history to train on."""
        df = pd.DataFrame(historical_transactions)
        if len(df) < 5 or 'tier' not in df.columns or df['tier'].nunique() < 2:
            return self._heuristic_predict_category(new_transaction, historical_transactions)

        df = df.dropna(subset=['tier', 'category'])

        def featurize(amount, description, merchant, date_value) -> List[float]:
            desc = f"{description or ''} {merchant or ''}".lower()
            date = pd.to_datetime(date_value)
            return [
                float(amount),
                float(np.log1p(max(0.0, amount))),
                float(date.dayofweek),
                float(date.day),
                float(len(desc)),
                float(any(k in desc for k in ['emi', 'loan', 'rent', 'insurance'])),
                float(any(k in desc for k in ['grocery', 'electricity', 'internet', 'fuel', 'bill'])),
                float(any(k in desc for k in ['dinner', 'restaurant', 'shopping', 'movie', 'travel', 'subscription'])),
                float(any(k in desc for k in ['unused', 'impulse', 'forgotten'])),
            ]

        X = [featurize(r['amount'], r.get('description'), r.get('merchant'), r['date']) for r in df.to_dict('records')]
        y_tier = df['tier'].tolist()
        y_category = df['category'].tolist()

        tier_clf = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=6)
        tier_clf.fit(X, y_tier)

        category_clf = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=6)
        category_clf.fit(X, y_category)

        new_features = [featurize(
            new_transaction['amount'],
            new_transaction.get('description'),
            new_transaction.get('merchant'),
            new_transaction.get('date') or datetime.utcnow().isoformat(),
        )]

        tier_pred = tier_clf.predict(new_features)[0]
        tier_conf = float(max(tier_clf.predict_proba(new_features)[0]))
        category_pred = category_clf.predict(new_features)[0]
        category_conf = float(max(category_clf.predict_proba(new_features)[0]))

        return {
            "predicted_tier": tier_pred,
            "tier_confidence": tier_conf,
            "predicted_category": category_pred,
            "category_confidence": category_conf,
            "method": "random_forest",
            "trained_on_transactions": int(len(df)),
        }

    @staticmethod
    def _heuristic_predict_category(new_transaction: Dict, historical_transactions: List[Dict]) -> Dict:
        """Fallback used when there isn't enough labeled history yet to train a model."""
        desc = f"{new_transaction.get('description', '')} {new_transaction.get('merchant', '')}".lower()
        if any(k in desc for k in ['emi', 'loan', 'rent', 'insurance']):
            tier, category = 'Tier_A_NonNegotiable', 'essential'
        elif any(k in desc for k in ['grocery', 'electricity', 'internet', 'fuel', 'bill']):
            tier, category = 'Tier_B_Optimizable', 'utilities'
        elif any(k in desc for k in ['subscription', 'unused', 'forgotten', 'impulse']):
            tier, category = 'Tier_D_Leakage', 'subscriptions'
        else:
            tier, category = 'Tier_C_Flexible', 'discretionary'
        return {
            "predicted_tier": tier,
            "tier_confidence": 0.5,
            "predicted_category": category,
            "category_confidence": 0.5,
            "method": "heuristic_fallback",
            "trained_on_transactions": len(historical_transactions),
        }
    
    def _analyze_by_tier(self, df: pd.DataFrame) -> Dict:
        """Analyze spending by expense tier"""
        return df.groupby('tier')['amount'].agg([
            ('total', 'sum'),
            ('count', 'count'),
            ('average', 'mean'),
            ('percentage', lambda x: (x.sum() / df['amount'].sum() * 100))
        ]).to_dict('index')
    
    def _analyze_by_category(self, df: pd.DataFrame) -> Dict:
        """Analyze spending by category"""
        return df.groupby('category')['amount'].agg([
            ('total', 'sum'),
            ('count', 'count'),
            ('average', 'mean'),
            ('percentage', lambda x: (x.sum() / df['amount'].sum() * 100))
        ]).to_dict('index')
    
    def _analyze_by_merchant(self, df: pd.DataFrame) -> Dict:
        """Analyze spending by merchant"""
        merchant_data = df.groupby('merchant')['amount'].agg(['sum', 'count', 'mean']).sort_values('sum', ascending=False)
        return merchant_data.head(20).to_dict('index')
    
    def _analyze_temporal_patterns(self, df: pd.DataFrame) -> Dict:
        """Analyze temporal spending patterns"""
        df['day_of_week'] = df['date'].dt.day_name()
        df['week_of_year'] = df['date'].dt.isocalendar().week
        df['day_of_month'] = df['date'].dt.day
        
        return {
            "by_day_of_week": df.groupby('day_of_week')['amount'].sum().to_dict(),
            "by_week_of_year": {int(k): v for k, v in df.groupby('week_of_year')['amount'].sum().to_dict().items()},
            "by_day_of_month": df.groupby('day_of_month')['amount'].mean().to_dict(),
            "weekend_spending": float(df[df['day_of_week'].isin(['Saturday', 'Sunday'])]['amount'].sum()),
            "weekday_spending": float(df[~df['day_of_week'].isin(['Saturday', 'Sunday'])]['amount'].sum()),
        }
    
    def _detect_anomalies(self, df: pd.DataFrame, z_score_threshold: float = 2.5) -> List[Dict]:
        """Detect anomalous transactions"""
        # Calculate z-scores by category
        anomalies = []
        
        for category in df['category'].unique():
            category_data = df[df['category'] == category]
            if len(category_data) < 3:
                continue
            
            mean = category_data['amount'].mean()
            std = category_data['amount'].std()
            
            if std == 0:
                continue
            
            z_scores = np.abs((category_data['amount'] - mean) / std)
            anomaly_mask = z_scores > z_score_threshold
            
            for idx, row in category_data[anomaly_mask].iterrows():
                anomalies.append({
                    "date": row['date'].isoformat(),
                    "amount": float(row['amount']),
                    "category": row['category'],
                    "description": row['description'],
                    "z_score": float(z_scores.loc[idx]),
                })
        
        return sorted(anomalies, key=lambda x: x['z_score'], reverse=True)
    
    def _detect_leakage(self, df: pd.DataFrame, threshold_percentage: float = 0.02) -> List[Dict]:
        """Detect financial leakage (small recurring expenses with large cumulative cost)"""
        recurring = SpendingAnalysis.detect_recurring_transactions(df.to_dict('records'))
        leakage_opportunities = []
        
        total_spending = df['amount'].sum()
        date_range_days = max(1, (df['date'].max() - df['date'].min()).days)
        monthly_total_spending = total_spending / (date_range_days / 30)
        
        for recurring_item in recurring:
            amount = recurring_item['amount']
            count = recurring_item['count']
            description = recurring_item['description']
            
            # Monthly cost of a recurring item is just its amount normalized to a 30-day
            # cadence — it must NOT also scale with `count` (how many times it happened to
            # occur across however much history we were given), or the same ₹499/month
            # subscription would report a bigger "monthly cost" the more months of
            # transaction history it's fed, which is wrong.
            if 'frequency_days' in recurring_item:
                monthly_cost = amount * (30 / recurring_item['frequency_days'])
            else:
                monthly_cost = amount  # Approximate: treat as already-monthly
            
            annual_cost = monthly_cost * 12
            impact_percentage = annual_cost / (monthly_total_spending * 12 + 0.01)
            
            if amount < 1000 and annual_cost > 5000:  # Small individual transaction, large annual cost
                leakage_opportunities.append({
                    "description": description,
                    "individual_amount": float(amount),
                    "monthly_cost": float(monthly_cost),
                    "annual_cost": float(annual_cost),
                    "frequency_days": recurring_item.get('frequency_days', 'unknown'),
                    "impact_percentage": float(impact_percentage),
                })
        
        return sorted(leakage_opportunities, key=lambda x: x['annual_cost'], reverse=True)
    
    def _estimate_confidence(self, df: pd.DataFrame) -> float:
        """Estimate data quality confidence"""
        confidence = 1.0
        
        # Penalty for uncategorized transactions
        uncategorized_pct = (df['category'] == 'Uncategorized').sum() / len(df)
        confidence *= (1 - uncategorized_pct * 0.5)
        
        # Penalty for sparse data
        date_range_days = (df['date'].max() - df['date'].min()).days
        if date_range_days < 30:
            confidence *= 0.5
        elif date_range_days < 90:
            confidence *= 0.7
        
        # Penalty for anomalies
        anomaly_count = df['is_anomaly'].sum() if 'is_anomaly' in df.columns else 0
        anomaly_pct = anomaly_count / len(df)
        confidence *= (1 - anomaly_pct * 0.3)
        
        return max(0.0, min(1.0, confidence))


class ExpenseNecessityScorer:
    """Scores how necessary each expense is"""
    
    @staticmethod
    def score_necessity(transaction: Dict, category_tier: str) -> float:
        """Score necessity of an expense (0-1)"""
        base_scores = {
            "Tier_A_NonNegotiable": 0.95,
            "Tier_B_Optimizable": 0.60,
            "Tier_C_Flexible": 0.15,
            "Tier_D_Leakage": 0.05,
        }
        
        score = base_scores.get(category_tier, 0.5)
        
        # Adjust based on amount (larger mandatory expenses are slightly more necessary)
        if category_tier == "Tier_A_NonNegotiable":
            score = min(1.0, score + transaction.get('amount', 0) / 100000 * 0.05)
        
        return score
    
    @staticmethod
    def score_cuttability(transaction: Dict, category_tier: str) -> float:
        """Score how easily an expense can be cut (0-1)"""
        return 1.0 - ExpenseNecessityScorer.score_necessity(transaction, category_tier)
    
    @staticmethod
    def score_goal_impact(transaction: Dict, category_tier: str, target_saving: float) -> float:
        """Score negative impact on goal achievement (-1 to 1)"""
        base_impacts = {
            "Tier_A_NonNegotiable": -0.2,
            "Tier_B_Optimizable": -0.5,
            "Tier_C_Flexible": -0.85,
            "Tier_D_Leakage": -1.0,
        }
        
        impact = base_impacts.get(category_tier, -0.5)
        
        # Larger expenses have more impact
        amount = transaction.get('amount', 0)
        if target_saving > 0:
            amount_impact = min(0.3, amount / target_saving)
            impact -= amount_impact
        
        return max(-1.0, min(1.0, impact))


class BehavioralSpendingAnalyzer:
    """Analyzes behavioral patterns in spending"""
    
    @staticmethod
    def detect_lifestyle_inflation(
        transactions_before: List[Dict],
        transactions_after: List[Dict],
        event_description: str = "salary increase"
    ) -> Dict:
        """Detect lifestyle inflation after income change"""
        df_before = pd.DataFrame(transactions_before)
        df_after = pd.DataFrame(transactions_after)
        
        if len(df_before) == 0 or len(df_after) == 0:
            return {"detected": False, "inflation_percentage": 0.0}
        
        # Dates arrive as raw ISO strings from the API layer — must convert before
        # subtracting them, otherwise this raises TypeError: unsupported operand str - str.
        df_before['date'] = pd.to_datetime(df_before['date'])
        df_after['date'] = pd.to_datetime(df_after['date'])
        
        avg_before = df_before['amount'].sum() / ((df_before['date'].max() - df_before['date'].min()).days / 30 + 1)
        avg_after = df_after['amount'].sum() / ((df_after['date'].max() - df_after['date'].min()).days / 30 + 1)
        
        inflation_pct = ((avg_after - avg_before) / avg_before * 100) if avg_before > 0 else 0
        
        return {
            "detected": bool(inflation_pct > 5),  # More than 5% increase; cast off numpy.bool_ (not JSON-serializable)
            "inflation_percentage": float(inflation_pct),
            "monthly_before": float(avg_before),
            "monthly_after": float(avg_after),
            "absolute_increase": float(avg_after - avg_before),
        }
    
    @staticmethod
    def detect_spending_triggers(
        transactions: List[Dict],
        trigger_events: List[Dict]  # e.g., [{"date": datetime, "type": "salary"}]
    ) -> Dict:
        """Detect spending triggers (e.g., salary-day spending)"""
        df = pd.DataFrame(transactions)
        df['date'] = pd.to_datetime(df['date'])
        
        triggers = defaultdict(list)
        
        for event in trigger_events:
            event_date = pd.to_datetime(event['date'])
            event_type = event['type']
            
            # Look at spending in 7 days after event
            window_start = event_date
            window_end = event_date + timedelta(days=7)
            
            window_spending = df[
                (df['date'] >= window_start) &
                (df['date'] <= window_end)
            ]['amount'].sum()
            
            triggers[event_type].append(float(window_spending))
        
        # Analyze trigger patterns
        result = {}
        for trigger_type, amounts in triggers.items():
            if amounts:
                result[trigger_type] = {
                    "average_spending": float(np.mean(amounts)),
                    "max_spending": float(np.max(amounts)),
                    "min_spending": float(np.min(amounts)),
                    "std_spending": float(np.std(amounts)),
                    "occurrences": len(amounts),
                }
        
        return result
    
    @staticmethod
    def identify_spending_personas(transactions: List[Dict]) -> Dict:
        """Identify spending behavior personas"""
        df = pd.DataFrame(transactions)
        
        if len(df) == 0:
            return {"persona": "insufficient_data", "confidence": 0.0}
        
        # Calculate key metrics
        total_spending = df['amount'].sum()
        avg_transaction = df['amount'].mean()
        flex_spending_pct = df[df['tier'].isin(['Tier_C_Flexible', 'Tier_D_Leakage'])]['amount'].sum() / total_spending
        consistency = 1.0 - (df['amount'].std() / (df['amount'].mean() + 0.01))
        
        # Classify persona
        if consistency > 0.7 and flex_spending_pct < 0.2:
            persona = "disciplined"
        elif consistency < 0.4 and flex_spending_pct > 0.4:
            persona = "impulsive"
        elif flex_spending_pct > 0.3 and avg_transaction > 5000:
            persona = "lifestyle_focused"
        elif avg_transaction < 2000 and flex_spending_pct < 0.15:
            persona = "frugal"
        else:
            persona = "balanced"
        
        return {
            "persona": persona,
            "confidence": float(min(1.0, abs(consistency - 0.5) * 2)),  # Higher confidence for extreme personas
            "metrics": {
                "consistency": float(consistency),
                "flex_spending_percentage": float(flex_spending_pct),
                "average_transaction": float(avg_transaction),
            }
        }


class SubscriptionAnalyzer:
    """Analyzes subscription and recurring payment patterns"""
    
    @staticmethod
    def analyze_subscriptions(recurring_transactions: List[Dict]) -> Dict:
        """Analyze subscription patterns"""
        subscriptions = []
        total_monthly_cost = 0
        total_annual_cost = 0
        
        for item in recurring_transactions:
            amount = item['amount']
            frequency_days = item.get('frequency_days', 30)
            
            monthly_cost = amount * (30 / frequency_days)
            annual_cost = monthly_cost * 12
            
            subscription = {
                "description": item['description'],
                "individual_amount": float(amount),
                "frequency_days": frequency_days,
                "monthly_cost": float(monthly_cost),
                "annual_cost": float(annual_cost),
                "consistency": float(item.get('consistency', 0.8)),
                "tier": item.get('tier'),
            }
            
            subscriptions.append(subscription)
            total_monthly_cost += monthly_cost
            total_annual_cost += annual_cost
        
        # Identify potentially unused/forgotten subscriptions. A subscription only ever
        # reaches this list with consistency >= 0.8 (detect_recurring_transactions's own
        # threshold), so "consistency < 0.5" alone could never fire — it was permanently
        # dead code and "Possibly Unused" always showed 0 regardless of the real data.
        # Tier_D_Leakage is this app's own category for forgotten subscriptions/unused
        # memberships (see config.py EXPENSE_CATEGORIES), so use that as the real signal.
        unused = [s for s in subscriptions if s['tier'] == 'Tier_D_Leakage' or s['consistency'] < 0.5]
        
        return {
            "total_subscriptions": len(subscriptions),
            "total_monthly_cost": float(total_monthly_cost),
            "total_annual_cost": float(total_annual_cost),
            "subscriptions": sorted(subscriptions, key=lambda x: x['annual_cost'], reverse=True),
            "potentially_unused": unused,
            "potential_savings": float(sum(s['annual_cost'] for s in unused)),
        }


class BillCreepDetector:
    """Detects recurring bills whose amount has quietly crept up over time"""

    @staticmethod
    def detect_creep(transactions: List[Dict], min_increase_pct: float = 5.0) -> List[Dict]:
        """Compare each recurring bill's earliest vs latest amount across the observed history."""
        df = pd.DataFrame(transactions)
        if len(df) == 0:
            return []
        df['date'] = pd.to_datetime(df['date'])

        creeping_bills = []
        for description, group in df.groupby('description'):
            group = group.sort_values('date')
            if len(group) < 2:
                continue
            first_amount = float(group.iloc[0]['amount'])
            last_amount = float(group.iloc[-1]['amount'])
            if first_amount <= 0:
                continue
            increase_pct = (last_amount - first_amount) / first_amount * 100
            if increase_pct >= min_increase_pct:
                creeping_bills.append({
                    "description": description,
                    "merchant": group.iloc[-1].get('merchant'),
                    "first_amount": first_amount,
                    "latest_amount": last_amount,
                    "increase_percentage": float(increase_pct),
                    "monthly_impact": float(last_amount - first_amount),
                    "annual_impact": float((last_amount - first_amount) * 12),
                    "occurrences": int(len(group)),
                })
        return sorted(creeping_bills, key=lambda x: x['annual_impact'], reverse=True)


if __name__ == "__main__":
    from data_generator import SyntheticExpenseGenerator
    from datetime import datetime, timedelta
    
    # Example usage
    print("Testing Expense Analyzer...")
    
    # Generate test transactions
    transactions = SyntheticExpenseGenerator.generate_transactions_for_period(
        datetime.utcnow() - timedelta(days=90),
        datetime.utcnow()
    )
    
    analyzer = ExpenseAnalyzer()
    analysis = analyzer.analyze_transactions(transactions)
    
    print(f"Total transactions: {analysis['total_transactions']}")
    print(f"Total spending: ₹{analysis['total_spending']:,.2f}")
    print(f"Monthly average: ₹{analysis['monthly_average']:,.2f}")
    print(f"Data confidence: {analysis['data_quality_confidence']:.2%}")
    print(f"Leakage opportunities: {len(analysis['leakage_opportunities'])}")
