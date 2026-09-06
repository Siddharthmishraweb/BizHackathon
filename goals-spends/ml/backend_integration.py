"""
Backend Integration Layer
Connects Express.js backend with Python ML Engine via HTTP bridge
"""
import json
import asyncio
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, Optional

# This module provides integration utilities for connecting the Express backend
# with the Python ML engine running on a separate port (8000)

class BackendBridge:
    """Handles communication between Express backend and ML engine"""
    
    def __init__(self, ml_api_url: str = "http://localhost:8000"):
        self.ml_api_url = ml_api_url
    
    @staticmethod
    def format_user_data_for_ml(user_data: Dict) -> Dict:
        """Transform Express backend user data to ML engine format"""
        
        return {
            "user_id": user_data.get("id"),
            "email": user_data.get("email"),
            "transactions": [
                {
                    "amount": t.get("amount"),
                    "category": t.get("category"),
                    "date": t.get("date"),
                    "description": t.get("description"),
                    "tier": t.get("tier"),
                    "merchant": t.get("merchant"),
                }
                for t in user_data.get("transactions", [])
            ],
            "income_sources": [
                {
                    "name": s.get("name"),
                    "amount": s.get("amount"),
                    "frequency": s.get("frequency", "monthly"),
                    "variability": s.get("variability", 0.1),
                    "probability": s.get("probability", 1.0),
                }
                for s in user_data.get("income_sources", [])
            ],
            "assets": [
                {
                    "name": a.get("name"),
                    "value": a.get("value"),
                    "asset_type": a.get("type"),
                    "liquidity": a.get("liquidity", "high"),
                    "returns_percentage": a.get("returns"),
                }
                for a in user_data.get("assets", [])
            ],
            "liabilities": [
                {
                    "name": l.get("name"),
                    "current_balance": l.get("balance"),
                    "interest_rate": l.get("interest_rate"),
                    "monthly_payment": l.get("monthly_payment"),
                    "remaining_months": l.get("remaining_months"),
                }
                for l in user_data.get("liabilities", [])
            ],
            "goals": [
                {
                    "name": g.get("name"),
                    "target_amount": g.get("target_amount"),
                    "current_amount": g.get("current_amount"),
                    "deadline": g.get("deadline"),
                    "category": g.get("category"),
                    "priority": g.get("priority", 1),
                }
                for g in user_data.get("goals", [])
            ],
        }
    
    @staticmethod
    def format_analysis_for_frontend(ml_analysis: Dict) -> Dict:
        """Transform ML analysis output to frontend-friendly format"""
        
        situation = ml_analysis.get("situation_analysis", {})
        
        return {
            "user_id": ml_analysis.get("user_id"),
            "analysis_timestamp": ml_analysis.get("generated_at"),
            "financial_health": {
                "net_worth": situation.get("financial_health", {}).get("net_worth"),
                "liquid_assets": situation.get("financial_health", {}).get("liquid_assets"),
                "total_assets": situation.get("financial_health", {}).get("total_assets"),
                "total_liabilities": situation.get("financial_health", {}).get("total_liabilities"),
            },
            "income": {
                "monthly": situation.get("income", {}).get("monthly_income"),
                "stability": situation.get("income", {}).get("monthly_income_stability"),
            },
            "expenses": {
                "monthly": situation.get("expenses", {}).get("monthly_spending"),
                "surplus": situation.get("expenses", {}).get("monthly_surplus"),
                "by_tier": situation.get("expenses", {}).get("spending_by_tier"),
            },
            "emergency_fund": {
                "status": situation.get("emergency_fund", {}).get("status"),
                "required": situation.get("emergency_fund", {}).get("required"),
                "available": situation.get("emergency_fund", {}).get("available"),
            },
            "spending_insights": {
                "persona": situation.get("behavioral", {}).get("spending_persona"),
                "subscriptions": situation.get("subscriptions", {}).get("total_count"),
                "subscription_cost_annual": situation.get("subscriptions", {}).get("total_annual_cost"),
                "potential_savings_annual": situation.get("subscriptions", {}).get("potential_savings_annual"),
                "leakage_annual": sum(
                    item.get("annual_cost", 0)
                    for item in situation.get("leakage", {}).get("identified_items", [])
                ),
            },
        }


# Example Express.js endpoint mapping (TypeScript pseudocode):
# 
# router.post('/api/user/:userId/analysis/comprehensive', async (req, res) => {
#   try {
#     // Get user data from database
#     const userData = await User.findById(req.params.userId).populate([...]);
#     
#     // Format for ML engine
#     const mlInput = BackendBridge.formatUserDataForML(userData);
#     
#     // Call ML API
#     const response = await fetch('http://localhost:8000/api/v1/analyze/comprehensive', {
#       method: 'POST',
#       headers: { 'Content-Type': 'application/json' },
#       body: JSON.stringify(mlInput),
#     });
#     
#     const analysis = await response.json();
#     
#     // Format for frontend
#     const formatted = BackendBridge.formatAnalysisForFrontend(analysis.plan);
#     
#     res.json({
#       status: 'success',
#       data: formatted,
#     });
#   } catch (error) {
#     res.status(500).json({ error: error.message });
#   }
# });


class MLEngineSyncManager:
    """Manages syncing data between backend and ML engine"""
    
    @staticmethod
    async def sync_user_data(user_id: str, backend_api_url: str = "http://localhost:3001"):
        """Fetch user data from backend and sync to ML engine"""
        # Implementation would fetch from backend and push to ML
        pass
    
    @staticmethod
    async def cache_analysis_results(user_id: str, analysis: Dict, ttl: int = 3600):
        """Cache analysis results to reduce recomputation"""
        # Implementation would store in Redis or similar
        pass
    
    @staticmethod
    async def invalidate_cache(user_id: str):
        """Invalidate cached results for user"""
        # Implementation would clear cache
        pass


# Environment configuration for integration
INTEGRATION_CONFIG = {
    "ML_API_URL": "http://localhost:8000",
    "ML_API_TIMEOUT": 30,
    "ENABLE_CACHING": True,
    "CACHE_TTL": 3600,
    "ASYNC_ANALYSIS": True,
    "BACKGROUND_WORKERS": 4,
}


# Health check for ML engine
async def check_ml_engine_health(ml_api_url: str = INTEGRATION_CONFIG["ML_API_URL"]) -> Dict:
    """Check if ML engine is running"""
    try:
        import httpx
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(f"{ml_api_url}/health")
            return {
                "status": "healthy",
                "ml_engine": response.json(),
            }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
        }


if __name__ == "__main__":
    print("\n" + "="*80)
    print("Backend Integration Layer for ML Engine")
    print("="*80 + "\n")
    
    print("Configuration:")
    for key, value in INTEGRATION_CONFIG.items():
        print(f"  {key}: {value}")
    
    print("\nIntegration Points:")
    print("  1. User Data Formatting: BackendBridge.format_user_data_for_ml()")
    print("  2. Analysis Formatting: BackendBridge.format_analysis_for_frontend()")
    print("  3. Health Checks: check_ml_engine_health()")
    print("  4. Data Sync: MLEngineSyncManager")
    
    print("\nExample Express.js Integration:")
    print("""
    // In your Express backend:
    import { BackendBridge } from './ml-integration';
    
    app.post('/api/user/:userId/goals/analyze', async (req, res) => {
      const userData = await User.findById(req.params.userId);
      const mlInput = BackendBridge.formatUserDataForML(userData);
      
      const response = await fetch('http://localhost:8000/api/v1/analyze/comprehensive', {
        method: 'POST',
        body: JSON.stringify(mlInput),
      });
      
      const analysis = await response.json();
      const formatted = BackendBridge.formatAnalysisForFrontend(analysis);
      
      res.json(formatted);
    });
    """)
    
    print("\n" + "="*80 + "\n")
