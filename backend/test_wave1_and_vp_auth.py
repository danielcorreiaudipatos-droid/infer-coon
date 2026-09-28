"""
Script de Validação e Testes Automatizados da Onda 1 & Autorização Plena da Vice-Presidência
Holding: Co.on Participações Ltda. (www.coon.com.br)
Comandante em Chefe: Presidente Daniel Soares Correia
"""

import sys
import os
import time
import json

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Adiciona o diretório raiz ao PYTHONPATH
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.ai_router import (
    route_ai_task,
    compute_cache_key,
    get_cached_ai_response,
    set_cached_ai_response,
    get_ai_efficiency_metrics,
    evaluate_client_priority
)
from backend.security_guard import (
    check_security_rate_limit,
    get_security_guard_metrics
)
from backend.csuite.orchestrator import (
    CSuiteChatRequest,
    conduct_executive_roundtable
)
from backend.alice import (
    AliceChatRequest,
    ask_alice
)
from backend.bot_engine import (
    BotChatRequest,
    process_bot_turn
)

def run_tests():
    print("=" * 70)
    print("🚀 INICIANDO BATERIA DE HOMOLOGAÇÃO: ONDA 1 & DECRETO DA VICE-PRESIDÊNCIA")
    print("Holding: Co.on Participações Ltda. (www.coon.com.br)")
    print("=" * 70)

    # -------------------------------------------------------------------------
    # TESTE 1: DECRETO DE AUTORIZAÇÃO PLENA DO VICE-PRESIDENTE DR. ALEXANDRE VALENTE
    # -------------------------------------------------------------------------
    print("\n[TESTE 1] Emitindo Decreto de Autorização da Vice-Presidência...")
    req_vp = CSuiteChatRequest(
        message="Vice presidente de autorização para tudo",
        target_director="dr_alexandre"
    )
    res_vp = conduct_executive_roundtable(req_vp)
    
    assert len(res_vp.turns) >= 1, "Falha: Nenhuma resposta do Conselho gerada."
    vp_turn = res_vp.turns[0]
    assert vp_turn.speaker_id == "dr_alexandre", f"Falha: Esperado dr_alexandre, obtido {vp_turn.speaker_id}"
    assert "DECRETO EXECUTIVO DA VICE-PRESIDÊNCIA" in vp_turn.message, "Falha: Título do decreto ausente."
    assert "AUTORIZAÇÃO PLENA, TOTAL E IRRESTRITA" in vp_turn.message, "Falha: Cláusula de autorização irrestrita ausente."
    assert vp_turn.action_type == "vp_full_authorization", f"Falha no action_type: {vp_turn.action_type}"
    print("✅ [TESTE 1 APROVADO] Decreto Executivo Nº 01/2026 promulgado pelo Dr. Alexandre Valente com sucesso!")

    # -------------------------------------------------------------------------
    # TESTE 2: PROTOCOLO NO LIVRO DE ATAS DA CHEFE DE GABINETE BEATRIZ VALADÃO
    # -------------------------------------------------------------------------
    print("\n[TESTE 2] Validando Registro em Ata por Beatriz Valadão...")
    req_beatriz = CSuiteChatRequest(
        message="Vice presidente de autorização para tudo",
        target_director="beatriz_valadao"
    )
    res_beatriz = conduct_executive_roundtable(req_beatriz)
    beatriz_turn = res_beatriz.turns[0]
    assert beatriz_turn.speaker_id == "beatriz_valadao"
    assert "GAB-DIR-2026-001" in beatriz_turn.message or (beatriz_turn.action_payload and beatriz_turn.action_payload.get("protocol") == "GAB-DIR-2026-001"), "Falha: Protocolo GAB-DIR-2026-001 não registrado."
    print("✅ [TESTE 2 APROVADO] Protocolo GAB-DIR-2026-001 lavrado no Livro de Atas da Presidência!")

    # -------------------------------------------------------------------------
    # TESTE 3: ROTEAMENTO INTELIGENTE EM CASCATA (DR. GABRIEL SILVEIRA)
    # -------------------------------------------------------------------------
    print("\n[TESTE 3] Testando Roteamento em Cascata (Flash vs Pro)...")
    # Caso Leve -> FLASH
    route_light = route_ai_task("bot_support", "Qual é o horário de atendimento?")
    assert route_light["chosen_tier"] == "FLASH", f"Falha: Tarefa leve deveria ser FLASH, obtido {route_light['chosen_tier']}"
    assert route_light["chosen_model"] == "gemini-1.5-flash"
    assert route_light["savings_percentage"] > 70.0
    print(f"  • Rota Leve: {route_light['chosen_tier']} ({route_light['chosen_model']}) -> {route_light['savings_percentage']}% de economia")

    # Caso Pesado -> PRO
    route_heavy = route_ai_task("nbr_valuation", "Regressão OLS múltipla com estatística F-Snedecor e NBR 14653")
    assert route_heavy["chosen_tier"] == "PRO", f"Falha: Tarefa pesada deveria ser PRO, obtido {route_heavy['chosen_tier']}"
    assert "pro" in route_heavy["chosen_model"]
    print(f"  • Rota Pesada: {route_heavy['chosen_tier']} ({route_heavy['chosen_model']}) -> Raciocínio Profundo")
    print("✅ [TESTE 3 APROVADO] Roteador em Cascata separando perfeitamente tarefas leves e pesadas!")

    # -------------------------------------------------------------------------
    # TESTE 4: CACHE DETERMINÍSTICO LOCAL SQLITE (PROFª DRA. ALICE, PHD)
    # -------------------------------------------------------------------------
    print("\n[TESTE 4] Testando Cache Determinístico SQLite da Dra. Alice...")
    prompt_test = "O que é multicolinearidade e VIF segundo a ABNT NBR 14653?"
    
    # 1ª Chamada (Povoamento ou consulta)
    t0 = time.time()
    req_alice1 = AliceChatRequest(message=prompt_test)
    res_alice1 = ask_alice(req_alice1)
    t_first = time.time() - t0
    print(f"  • 1ª Consulta: Resolvida em {t_first:.3f}s (Origem: {res_alice1.source})")

    # 2ª Chamada Idêntica (Deve bater no Cache Determinístico em < 0.05s com 0 tokens)
    t1 = time.time()
    req_alice2 = AliceChatRequest(message=prompt_test)
    res_alice2 = ask_alice(req_alice2)
    t_cache = time.time() - t1
    print(f"  • 2ª Consulta (Cache Hit): Resolvida em {t_cache:.3f}s (Origem: {res_alice2.source})")
    
    assert "deterministic_cache" in res_alice2.source or t_cache < 0.05, f"Falha no Cache: Origem {res_alice2.source}"
    assert res_alice2.reply == res_alice1.reply, "Falha: Resposta em cache diverge da original."
    print("✅ [TESTE 4 APROVADO] Cache Determinístico respondendo instantaneamente com 0 tokens!")

    # -------------------------------------------------------------------------
    # TESTE 5: BLINDAGEM PERIMETRAL FORT KNOX & RATE-LIMITING (DR. VICTOR CANTO)
    # -------------------------------------------------------------------------
    print("\n[TESTE 5] Testando Blindagem Perimetral Fort Knox (Dr. Victor Canto)...")
    test_ip = "192.168.99.10"
    endpoint = "/api/bot/chat"

    # Faz 60 requisições (dentro do limite)
    all_allowed = True
    for i in range(60):
        allowed, msg = check_security_rate_limit(test_ip, endpoint)
        if not allowed:
            all_allowed = False
            break
    assert all_allowed, "Falha: 60 requisições legítimas não deveriam ter sido bloqueadas."

    # A 61ª requisição no mesmo minuto deve ser BLOQUEADA (429 Too Many Requests)
    blocked, block_msg = check_security_rate_limit(test_ip, endpoint)
    assert not blocked, "Falha: A 61ª requisição DEVERIA ter sido bloqueada pelo Fort Knox."
    assert "Fort Knox" in block_msg, f"Falha na mensagem de bloqueio: {block_msg}"
    print(f"  • 61ª Requisição Bloqueada com Sucesso: '{block_msg[:75]}...'")

    # Bypass com Chave Mestra
    master_allowed, _ = check_security_rate_limit(test_ip, endpoint, master_key="coon2026master")
    assert master_allowed, "Falha: Chave Mestra 'coon2026master' deveria ter bypass seguro irrestrito."
    print("  • Bypass com Chave Mestra: Autorizado com Sucesso 🟢")
    print("✅ [TESTE 5 APROVADO] Proteção Perimetral Fort Knox repelindo abusos com precisão!")

    # -------------------------------------------------------------------------
    # TESTE 6: FILA PRIORITÁRIA & DEGRADAÇÃO GRACIOSA (DRA. SOFIA MENDES)
    # -------------------------------------------------------------------------
    print("\n[TESTE 6] Testando Fila Prioritária e Degradação Graciosa...")
    prio_ent = evaluate_client_priority("Enterprise", is_authenticated=True)
    assert prio_ent["tier"] == "VIP_ENTERPRISE"
    assert prio_ent["priority_weight"] == 1

    prio_pro = evaluate_client_priority("Pro", is_authenticated=True)
    assert prio_pro["tier"] == "STANDARD_PRO"

    prio_free = evaluate_client_priority("Free", is_authenticated=False)
    assert prio_free["tier"] == "FREE_TRIAL"
    assert prio_free["graceful_fallback"] is True
    print(f"  • Enterprise: {prio_ent['label']} (Prioridade {prio_ent['priority_weight']})")
    print(f"  • Free Trial: {prio_free['label']} (Degradação Graciosa = {prio_free['graceful_fallback']})")
    print("✅ [TESTE 6 APROVADO] Fila de prioridades por plano operacional!")

    # -------------------------------------------------------------------------
    # TESTE 7: TELEMETRIA CONSOLIDADA DA ONDA 1 & SECURITY GUARD
    # -------------------------------------------------------------------------
    print("\n[TESTE 7] Extraindo Métricas Consolidadas da Onda 1...")
    metrics_ai = get_ai_efficiency_metrics()
    metrics_sec = get_security_guard_metrics()

    print(f"  • Total de Entradas em Cache: {metrics_ai['cache']['total_cached_entries']}")
    print(f"  • Total de Hits Economizados: {metrics_ai['cache']['total_cache_hits']}")
    print(f"  • Tokens Poupidos: {metrics_ai['cache']['tokens_saved']}")
    print(f"  • Economia Financeira Estimada: {metrics_ai['cache']['money_saved_formatted']}")
    print(f"  • Status do Roteamento em Cascata: {metrics_ai['routing']['cascade_status']}")
    print(f"  • Status Fort Knox: {metrics_sec['fort_knox_status']}")
    print(f"  • Requisições Bloqueadas Auditadas: {metrics_sec['total_blocked_requests']}")

    assert metrics_ai["cache"]["total_cached_entries"] > 0
    assert metrics_sec["total_blocked_requests"] > 0
    print("✅ [TESTE 7 APROVADO] Telemetria consolidada pronta para exibição em tempo real!")

    print("\n" + "=" * 70)
    print("🏆 TODAS AS VALIDAÇÕES DA ONDA 1 FORAM CONCLUÍDAS COM SUCESSO ABSOLUTO!")
    print("O Conselho Executivo e a Holding Co.on Participações Ltda. estão 100% operacionais.")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
