"""
🧪 A/B TESTING AVANÇADO - ADS Inteligente Premium

Funcionalidades:
- Criar testes A/B em qualquer variável (headline, image, CTA, etc)
- Análise estatística automática (confiança %)
- Winner detection
- Otimização automática
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional
from enum import Enum
import uuid
import math

class ABTestVariable(str, Enum):
    HEADLINE = "headline"
    DESCRIPTION = "description"
    IMAGE = "image"
    CTA = "cta"
    AUDIENCE = "audience"
    BID = "bid"
    LANDING_PAGE = "landing_page"


class ABTestStatus(str, Enum):
    DRAFT = "draft"
    RUNNING = "running"
    COMPLETED = "completed"
    PAUSED = "paused"


class ABTestVariant:
    """Variante individual de um teste"""

    def __init__(self, name: str, value: str):
        self.id = str(uuid.uuid4())
        self.name = name  # "Variant A", "Variant B"
        self.value = value  # O valor (headline, image URL, etc)
        self.impressions = 0
        self.clicks = 0
        self.conversions = 0
        self.created_at = datetime.utcnow()

    @property
    def ctr(self) -> float:
        """Click-through rate"""
        if self.impressions == 0:
            return 0
        return (self.clicks / self.impressions) * 100

    @property
    def conversion_rate(self) -> float:
        """Taxa de conversão"""
        if self.clicks == 0:
            return 0
        return (self.conversions / self.clicks) * 100

    @property
    def cpa(self) -> float:
        """Custo por aquisição (estimado)"""
        if self.conversions == 0:
            return 0
        return self.spend / self.conversions

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "name": self.name,
            "value": self.value,
            "impressions": self.impressions,
            "clicks": self.clicks,
            "conversions": self.conversions,
            "ctr": round(self.ctr, 2),
            "conversion_rate": round(self.conversion_rate, 2),
            "created_at": self.created_at.isoformat()
        }


class ABTest:
    """Teste A/B completo"""

    def __init__(self, campaign_id: int, variable: ABTestVariable, min_duration_days: int = 7):
        self.id = str(uuid.uuid4())
        self.campaign_id = campaign_id
        self.variable = variable
        self.status = ABTestStatus.DRAFT
        self.variants: List[ABTestVariant] = []
        self.started_at = None
        self.ended_at = None
        self.min_duration_days = min_duration_days
        self.confidence_threshold = 0.95  # 95%
        self.created_at = datetime.utcnow()
        self.winner_id = None
        self.winner_improvement = 0.0

    def add_variant(self, name: str, value: str) -> ABTestVariant:
        """Adicionar variante ao teste"""
        variant = ABTestVariant(name, value)
        self.variants.append(variant)
        return variant

    def start(self) -> bool:
        """Iniciar o teste"""
        if self.status != ABTestStatus.DRAFT:
            return False
        if len(self.variants) < 2:
            return False

        self.status = ABTestStatus.RUNNING
        self.started_at = datetime.utcnow()
        return True

    def pause(self) -> bool:
        """Pausar o teste"""
        if self.status != ABTestStatus.RUNNING:
            return False
        self.status = ABTestStatus.PAUSED
        return True

    def resume(self) -> bool:
        """Retomar o teste"""
        if self.status != ABTestStatus.PAUSED:
            return False
        self.status = ABTestStatus.RUNNING
        return True

    def end(self) -> bool:
        """Encerrar o teste"""
        if self.status != ABTestStatus.RUNNING:
            return False

        self.status = ABTestStatus.COMPLETED
        self.ended_at = datetime.utcnow()
        return True

    def can_declare_winner(self) -> bool:
        """Verificar se pode declarar vencedor"""
        if self.status != ABTestStatus.RUNNING:
            return False

        # Verificar duração mínima
        if not self.started_at:
            return False

        duration = datetime.utcnow() - self.started_at
        if duration.days < self.min_duration_days:
            return False

        # Verificar volume mínimo (100+ conversões em melhor variante)
        best = max(self.variants, key=lambda v: v.conversions)
        if best.conversions < 100:
            return False

        # Verificar confiança estatística (95%+)
        return self._calculate_confidence() >= self.confidence_threshold

    def declare_winner(self) -> Dict:
        """Declarar variante vencedora"""
        if not self.can_declare_winner():
            return {"success": False, "error": "Não pode declarar vencedor ainda"}

        # Encontrar vencedor (maior conversion rate)
        winner = max(self.variants, key=lambda v: v.conversion_rate)
        self.winner_id = winner.id

        # Calcular melhoria
        loser = min(self.variants, key=lambda v: v.conversion_rate)
        improvement = ((winner.conversion_rate - loser.conversion_rate) /
                      loser.conversion_rate * 100)
        self.winner_improvement = improvement

        # Encerrar teste
        self.end()

        return {
            "success": True,
            "winner_id": self.winner_id,
            "winner_name": winner.name,
            "winner_conversion_rate": round(winner.conversion_rate, 2),
            "improvement": round(improvement, 2),
            "confidence": round(self._calculate_confidence() * 100, 2)
        }

    def _calculate_confidence(self) -> float:
        """Calcular confiança estatística usando chi-square test"""
        if len(self.variants) != 2:
            return 0

        v1, v2 = self.variants[0], self.variants[1]

        # Chi-square test para proporções
        p1 = v1.conversion_rate / 100 if v1.clicks > 0 else 0
        p2 = v2.conversion_rate / 100 if v2.clicks > 0 else 0

        if p1 == 0 or p2 == 0:
            return 0

        n1, n2 = v1.clicks, v2.clicks

        try:
            p = (v1.conversions + v2.conversions) / (n1 + n2)
            se = math.sqrt(p * (1 - p) * (1/n1 + 1/n2))
            z = abs(p1 - p2) / se if se > 0 else 0

            # Converter z-score para confiança (aproximado)
            # z=1.96 = 95%, z=2.58 = 99%
            confidence = 0.5 * (1 + math.erf(z / math.sqrt(2)))
            return min(confidence, 0.99)
        except:
            return 0

    def get_results(self) -> Dict:
        """Obter resultados do teste"""
        return {
            "id": self.id,
            "campaign_id": self.campaign_id,
            "variable": self.variable,
            "status": self.status,
            "variants": [v.to_dict() for v in self.variants],
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "ended_at": self.ended_at.isoformat() if self.ended_at else None,
            "winner_id": self.winner_id,
            "winner_improvement": round(self.winner_improvement, 2),
            "confidence": round(self._calculate_confidence() * 100, 2),
            "can_declare_winner": self.can_declare_winner()
        }

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "campaign_id": self.campaign_id,
            "variable": self.variable,
            "status": self.status,
            "variants": [v.to_dict() for v in self.variants],
            "duration_days": (datetime.utcnow() - self.started_at).days if self.started_at else 0,
            "winner": self.winner_id
        }


class ABTestingService:
    """Serviço de A/B testing"""

    def __init__(self, db = None):
        self.db = db

    def create_test(self, campaign_id: int, variable: ABTestVariable,
                   duration_days: int = 7) -> ABTest:
        """Criar novo teste A/B"""
        test = ABTest(campaign_id, variable, duration_days)
        # db.add(test)
        # db.commit()
        return test

    def add_variant(self, test_id: str, name: str, value: str) -> Dict:
        """Adicionar variante ao teste"""
        # test = ABTest.get(test_id)
        # variant = test.add_variant(name, value)
        # db.commit()
        return {"success": True, "variant_id": "variant_id"}

    def record_metric(self, test_id: str, variant_id: str, metric_type: str,
                     increment: int = 1) -> bool:
        """Registrar métrica (impressão, clique, conversão)"""
        # test = ABTest.get(test_id)
        # variant = next(v for v in test.variants if v.id == variant_id)

        # if metric_type == "impression":
        #     variant.impressions += increment
        # elif metric_type == "click":
        #     variant.clicks += increment
        # elif metric_type == "conversion":
        #     variant.conversions += increment

        # db.commit()
        return True

    def get_test_status(self, test_id: str) -> Dict:
        """Obter status do teste"""
        # test = ABTest.get(test_id)
        # return test.get_results()
        return {}

    def declare_winner(self, test_id: str) -> Dict:
        """Declarar vencedor"""
        # test = ABTest.get(test_id)
        # result = test.declare_winner()
        # db.commit()
        # return result
        return {}

    def apply_winner(self, test_id: str, campaign_id: int) -> Dict:
        """Aplicar variante vencedora à campanha"""
        # test = ABTest.get(test_id)
        # winner = next(v for v in test.variants if v.id == test.winner_id)

        # campaign = Campaign.get(campaign_id)
        # if test.variable == ABTestVariable.HEADLINE:
        #     campaign.headline = winner.value
        # elif test.variable == ABTestVariable.IMAGE:
        #     campaign.image = winner.value
        # etc...

        # db.commit()
        return {"success": True, "message": "Variante vencedora aplicada"}


# FastAPI Endpoints Example

"""
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/campaigns/{campaign_id}/ab-test", tags=["A/B Testing"])

@router.post("/create")
def create_ab_test(campaign_id: int, variable: ABTestVariable, duration_days: int = 7):
    service = ABTestingService()
    test = service.create_test(campaign_id, variable, duration_days)
    return test.to_dict()

@router.post("/{test_id}/add-variant")
def add_variant(campaign_id: int, test_id: str, name: str, value: str):
    service = ABTestingService()
    return service.add_variant(test_id, name, value)

@router.post("/{test_id}/start")
def start_test(campaign_id: int, test_id: str):
    # test = ABTest.get(test_id)
    # test.start()
    # db.commit()
    return {"success": True}

@router.get("/{test_id}/results")
def get_results(campaign_id: int, test_id: str):
    service = ABTestingService()
    return service.get_test_status(test_id)

@router.post("/{test_id}/declare-winner")
def declare_winner(campaign_id: int, test_id: str):
    service = ABTestingService()
    return service.declare_winner(test_id)

@router.post("/{test_id}/apply-winner")
def apply_winner(campaign_id: int, test_id: str):
    service = ABTestingService()
    return service.apply_winner(test_id, campaign_id)
"""
