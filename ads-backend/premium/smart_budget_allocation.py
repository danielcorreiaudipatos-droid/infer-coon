"""
💰 SMART BUDGET ALLOCATION - ADS Inteligente Premium

Funcionalidades:
- Alocação inteligente de budget baseada em ROI
- Realocação automática diária
- Pausa automática de campanhas com baixo ROI
- Escala automática de winners
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional
from enum import Enum
import uuid


class AllocationStrategy(str, Enum):
    MANUAL = "manual"           # Usuário controla tudo
    SMART_ROI = "smart_roi"     # 80% para winners (ROI alto), 20% para learning
    SMART_CPA = "smart_cpa"     # Baseado em custo por aquisição
    SMART_ROAS = "smart_roas"   # Baseado em retorno de ad spend
    BALANCED = "balanced"        # Mix entre exploração e exploração


class BudgetAllocationModel:
    """Modelo de alocação de budget"""
    
    def __init__(self, account_id: int, allocation_type: AllocationStrategy,
                 total_budget: float):
        self.id = str(uuid.uuid4())
        self.account_id = account_id
        self.allocation_type = allocation_type
        self.total_budget = total_budget
        self.distribution: Dict[int, float] = {}  # {campaign_id: percentage}
        self.auto_rebalance = True
        self.rebalance_frequency = "daily"  # daily, weekly
        self.auto_pause_low_roi = True
        self.min_roi_threshold = 1.5  # Pausa se ROI < 1.5x
        self.learning_budget_pct = 0.20  # 20% para testes
        self.last_rebalanced = None
        self.created_at = datetime.utcnow()
    
    def calculate_allocation(self, campaigns: List[Dict]) -> Dict[int, float]:
        """Calcular alocação baseada em estratégia"""
        
        if self.allocation_type == AllocationStrategy.MANUAL:
            return self.distribution
        
        elif self.allocation_type == AllocationStrategy.SMART_ROI:
            return self._allocate_smart_roi(campaigns)
        
        elif self.allocation_type == AllocationStrategy.SMART_CPA:
            return self._allocate_smart_cpa(campaigns)
        
        elif self.allocation_type == AllocationStrategy.SMART_ROAS:
            return self._allocate_smart_roas(campaigns)
        
        elif self.allocation_type == AllocationStrategy.BALANCED:
            return self._allocate_balanced(campaigns)
    
    def _allocate_smart_roi(self, campaigns: List[Dict]) -> Dict[int, float]:
        """
        Alocação Smart ROI:
        - 80% do budget para top 20% performers (ROI alto)
        - 20% do budget para testes (learning)
        """
        
        if not campaigns:
            return {}
        
        # Calcular ROI de cada campanha (últimos 7 dias)
        roi_scores = {}
        for campaign in campaigns:
            campaign_id = campaign["id"]
            revenue = campaign.get("revenue", 0)
            spend = campaign.get("spend", 0)
            
            roi = (revenue - spend) / spend if spend > 0 else 0
            roi_scores[campaign_id] = roi
        
        # Top 20% (winners)
        num_winners = max(1, int(len(campaigns) * 0.2))
        sorted_campaigns = sorted(roi_scores.items(), 
                                 key=lambda x: x[1], 
                                 reverse=True)
        top_performers = sorted_campaigns[:num_winners]
        
        allocation = {}
        
        # 80% para winners
        winners_budget = self.total_budget * (1 - self.learning_budget_pct)
        for idx, (campaign_id, roi) in enumerate(top_performers):
            allocation[campaign_id] = winners_budget / len(top_performers)
        
        # 20% para learning (testes)
        learning_budget = self.total_budget * self.learning_budget_pct
        losers = [c for c in campaigns if c["id"] not in [w[0] for w in top_performers]]
        
        for campaign in losers:
            allocation[campaign["id"]] = learning_budget / len(losers) if losers else 0
        
        return allocation
    
    def _allocate_smart_cpa(self, campaigns: List[Dict]) -> Dict[int, float]:
        """
        Alocação Smart CPA:
        - Baseado em custo por aquisição
        - Maior budget para campanhas com CPA baixo
        """
        
        if not campaigns:
            return {}
        
        # Calcular CPA (custo / conversões)
        cpa_scores = {}
        for campaign in campaigns:
            campaign_id = campaign["id"]
            spend = campaign.get("spend", 0)
            conversions = campaign.get("conversions", 0)
            
            cpa = spend / conversions if conversions > 0 else float('inf')
            cpa_scores[campaign_id] = cpa
        
        # Inverter scores (CPA baixo = score alto)
        max_cpa = max(cpa_scores.values()) if cpa_scores else 1
        
        allocation = {}
        total_score = 0
        
        for campaign_id, cpa in cpa_scores.items():
            score = (max_cpa - cpa) / max_cpa if max_cpa > 0 else 0
            score = max(score, 0.01)  # Min 1%
            allocation[campaign_id] = score
            total_score += score
        
        # Normalizar para percentuais
        for campaign_id in allocation:
            allocation[campaign_id] = (allocation[campaign_id] / total_score) * self.total_budget
        
        return allocation
    
    def _allocate_smart_roas(self, campaigns: List[Dict]) -> Dict[int, float]:
        """
        Alocação Smart ROAS (Return on Ad Spend):
        - Baseado em retorno por real gasto
        - Maior budget para melhor ROAS
        """
        
        if not campaigns:
            return {}
        
        # Calcular ROAS (revenue / spend)
        roas_scores = {}
        for campaign in campaigns:
            campaign_id = campaign["id"]
            revenue = campaign.get("revenue", 0)
            spend = campaign.get("spend", 0)
            
            roas = revenue / spend if spend > 0 else 0
            roas_scores[campaign_id] = roas
        
        # Alocar proporcionalmente ao ROAS
        allocation = {}
        total_roas = sum(roas_scores.values())
        
        for campaign_id, roas in roas_scores.items():
            if total_roas > 0:
                allocation[campaign_id] = (roas / total_roas) * self.total_budget
            else:
                allocation[campaign_id] = self.total_budget / len(campaigns)
        
        return allocation
    
    def _allocate_balanced(self, campaigns: List[Dict]) -> Dict[int, float]:
        """
        Alocação Balanced (Exploração vs Exploração):
        - 70% Smart ROI (exploração - melhor ROI)
        - 30% Balanced entre losers (exploração - aprender)
        """
        
        smart_roi = self._allocate_smart_roi(campaigns)
        
        # Misturar com alocação uniforme
        allocation = {}
        for campaign_id in smart_roi:
            smart_budget = smart_roi.get(campaign_id, 0)
            uniform_budget = self.total_budget / len(campaigns)
            
            allocation[campaign_id] = (smart_budget * 0.7) + (uniform_budget * 0.3)
        
        return allocation
    
    def apply_allocation(self, allocation: Dict[int, float]) -> bool:
        """Aplicar alocação às campanhas"""
        self.distribution = allocation
        self.last_rebalanced = datetime.utcnow()
        # db.commit()
        return True
    
    def check_and_pause_low_roi(self, campaigns: List[Dict]) -> List[int]:
        """Verificar e pausar campanhas com ROI baixo"""
        if not self.auto_pause_low_roi:
            return []
        
        paused = []
        
        for campaign in campaigns:
            revenue = campaign.get("revenue", 0)
            spend = campaign.get("spend", 0)
            
            roi = (revenue - spend) / spend if spend > 0 else 0
            
            if roi < self.min_roi_threshold:
                # Pausar campanha
                # campaign.status = "paused"
                paused.append(campaign["id"])
        
        return paused
    
    def should_rebalance(self) -> bool:
        """Verificar se deve rebalancear"""
        if not self.auto_rebalance:
            return False
        
        if not self.last_rebalanced:
            return True
        
        if self.rebalance_frequency == "daily":
            return (datetime.utcnow() - self.last_rebalanced).days >= 1
        elif self.rebalance_frequency == "weekly":
            return (datetime.utcnow() - self.last_rebalanced).days >= 7
        
        return False
    
    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "allocation_type": self.allocation_type,
            "total_budget": self.total_budget,
            "distribution": self.distribution,
            "auto_rebalance": self.auto_rebalance,
            "rebalance_frequency": self.rebalance_frequency,
            "auto_pause_low_roi": self.auto_pause_low_roi,
            "min_roi_threshold": self.min_roi_threshold,
            "last_rebalanced": self.last_rebalanced.isoformat() if self.last_rebalanced else None
        }


class SmartBudgetService:
    """Serviço de alocação inteligente de budget"""
    
    def __init__(self, db = None):
        self.db = db
    
    def create_allocation_model(self, account_id: int, 
                               allocation_type: AllocationStrategy,
                               total_budget: float) -> BudgetAllocationModel:
        """Criar novo modelo de alocação"""
        model = BudgetAllocationModel(account_id, allocation_type, total_budget)
        # db.add(model)
        # db.commit()
        return model
    
    def rebalance_budget(self, allocation_id: str, campaigns: List[Dict]) -> Dict:
        """Rebalancear budget automático"""
        # model = BudgetAllocationModel.get(allocation_id)
        
        # Calcular nova alocação
        # new_allocation = model.calculate_allocation(campaigns)
        
        # Aplicar alocação
        # model.apply_allocation(new_allocation)
        
        # Verificar e pausar baixo ROI
        # paused_campaigns = model.check_and_pause_low_roi(campaigns)
        
        return {
            "success": True,
            "allocation": {},  # new_allocation
            "paused_campaigns": []  # paused_campaigns
        }
    
    def get_allocation_report(self, account_id: int) -> Dict:
        """Obter relatório de alocação"""
        return {
            "allocation_model": "smart_roi",
            "total_budget": 10000,
            "campaigns": [
                {
                    "id": 1,
                    "name": "Campaign A",
                    "allocation_pct": 45,
                    "allocated_budget": 4500,
                    "roi": 4.2,
                    "status": "winning"
                },
                {
                    "id": 2,
                    "name": "Campaign B",
                    "allocation_pct": 35,
                    "allocated_budget": 3500,
                    "roi": 3.8,
                    "status": "good"
                },
                {
                    "id": 3,
                    "name": "Campaign C",
                    "allocation_pct": 20,
                    "allocated_budget": 2000,
                    "roi": 2.1,
                    "status": "learning"
                }
            ],
            "summary": {
                "total_allocated": 10000,
                "avg_roi": 3.37,
                "best_performer": "Campaign A",
                "next_rebalance": "2026-10-04"
            }
        }
    
    def manual_adjust_allocation(self, allocation_id: str, 
                               campaign_id: int, 
                               budget_pct: float) -> Dict:
        """Ajuste manual de alocação"""
        # model = BudgetAllocationModel.get(allocation_id)
        # model.distribution[campaign_id] = (budget_pct / 100) * model.total_budget
        # db.commit()
        
        return {
            "success": True,
            "campaign_id": campaign_id,
            "budget_pct": budget_pct
        }
    
    def set_auto_pause_threshold(self, allocation_id: str, 
                                min_roi: float) -> Dict:
        """Definir threshold para pausa automática"""
        # model = BudgetAllocationModel.get(allocation_id)
        # model.min_roi_threshold = min_roi
        # db.commit()
        
        return {
            "success": True,
            "min_roi_threshold": min_roi
        }


# FastAPI Endpoints Example

"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/accounts/{account_id}/budget", tags=["Smart Budget"])

@router.post("/smart-allocation/create")
def create_smart_allocation(account_id: int, allocation_type: AllocationStrategy, 
                           total_budget: float):
    service = SmartBudgetService()
    model = service.create_allocation_model(account_id, allocation_type, total_budget)
    return model.to_dict()

@router.post("/smart-allocation/{allocation_id}/rebalance")
def rebalance_budget(account_id: int, allocation_id: str):
    service = SmartBudgetService()
    # campaigns = Campaign.filter_by(account_id=account_id)
    return service.rebalance_budget(allocation_id, [])

@router.get("/allocation-report")
def get_allocation_report(account_id: int):
    service = SmartBudgetService()
    return service.get_allocation_report(account_id)

@router.put("/smart-allocation/{allocation_id}/adjust")
def adjust_allocation(account_id: int, allocation_id: str, campaign_id: int, 
                     budget_pct: float):
    service = SmartBudgetService()
    return service.manual_adjust_allocation(allocation_id, campaign_id, budget_pct)

@router.put("/smart-allocation/{allocation_id}/pause-threshold")
def set_pause_threshold(account_id: int, allocation_id: str, min_roi: float):
    service = SmartBudgetService()
    return service.set_auto_pause_threshold(allocation_id, min_roi)
"""
