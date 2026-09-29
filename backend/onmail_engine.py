"""
==============================================================================
ONMAIL ENGINE — E-mail Corporativo Inteligente com Ponte para WhatsApp
Holding: Coon Participações Ltda. (www.coon.com.br / onmail.coon.com.br)
==============================================================================
Regras de Negócio:
1. Triagem Inteligente de Anexos:
   - Cenário 1: 1 anexo e <= 15 MB -> Envio direto do arquivo com legenda.
   - Cenário 2: Múltiplos anexos ou até 60 MB -> Compactação automática em .zip único.
   - Cenário 3: > 60 MB -> Armazenamento temporário seguro (Cloudflare R2 / S3) com link de 48h.
2. Filtro de Remetentes VIP (Plano Start / Gratuito):
   - Até 2 remetentes cadastrados geram alertas instantâneos.
   - Demais remetentes vão para o Digest Diário das 18h.
3. Planos:
   - Start (Gratuito): R$ 0,00
   - Empresarial Base: R$ 49,90 / mês
   - Empresarial Anual: R$ 499,00 / ano (Domínio .com.br incluso)
==============================================================================
"""

import os
import io
import time
import zipfile
import hashlib
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

LIMIT_DIRECT_MB = 15.0
LIMIT_ZIP_MB = 60.0

ONMAIL_PLANS: Dict[str, Dict[str, Any]] = {
    "start": {
        "id": "start",
        "name": "OnMail Start (Gratuito)",
        "price_monthly": 0.0,
        "price_yearly": 0.0,
        "accounts": 1,
        "storage_gb": 2,
        "vip_senders_limit": 2,
        "instant_whatsapp": True,
        "daily_digest": True,
        "badge": "Gratuito para Sempre",
        "features": [
            "1 conta de e-mail corporativo",
            "Até 2 Remetentes VIP com alerta instantâneo no WhatsApp",
            "Resumo diário às 18h dos demais e-mails",
            "Triagem automática de anexos até 15 MB",
            "Webmail moderno e compatível com celular"
        ]
    },
    "business": {
        "id": "business",
        "name": "OnMail Empresarial Base",
        "price_monthly": 49.90,
        "price_yearly": 499.00,
        "accounts": 5,
        "storage_gb": 10,
        "vip_senders_limit": -1, # Ilimitado
        "instant_whatsapp": True,
        "daily_digest": True,
        "badge": "Mais Popular",
        "features": [
            "Até 5 contas corporativas (@suaempresa.com.br)",
            "Alertas instantâneos ILIMITADOS no WhatsApp para a equipe",
            "Empacotamento automático de múltiplos anexos (.zip)",
            "Links de nuvem com download seguro para arquivos pesados",
            "Anti-spam corporativo e conformidade DMARC/SPF",
            "Cliente já possui domínio registrado"
        ]
    },
    "business_annual": {
        "id": "business_annual",
        "name": "OnMail Empresarial Anual + Domínio",
        "price_monthly": 41.58, # Equivalente a 499/12
        "price_yearly": 499.00,
        "accounts": 5,
        "storage_gb": 10,
        "vip_senders_limit": -1,
        "instant_whatsapp": True,
        "daily_digest": True,
        "badge": "Melhor Custo-Benefício (2 Meses Grátis)",
        "features": [
            "Tudo do plano Empresarial Base",
            "1 Domínio .com.br novo INCLUSO (gestão técnica Coon)",
            "DNS e certificados SSL configurados automaticamente",
            "Suporte prioritário via WhatsApp com a equipe Coon",
            "Economia de R$ 100 ao ano"
        ]
    }
}

class AttachmentItem(BaseModel):
    name: str = Field(..., description="Nome do arquivo com extensão (ex: laudo.pdf)")
    size_mb: float = Field(..., description="Tamanho em Megabytes")
    mime_type: Optional[str] = Field("application/octet-stream", description="Tipo MIME")
    content_base64: Optional[str] = Field(None, description="Conteúdo em base64 se presente")

class EmailSimulationRequest(BaseModel):
    sender: str = Field("contato@clienteimportante.com.br", description="Remetente do e-mail")
    recipient: str = Field("voce@suaempresa.com.br", description="Destinatário corporativo")
    subject: str = Field("Proposta Comercial e Relatório da Vistoria Técnica", description="Assunto do e-mail")
    body_text: str = Field("Olá! Segue em anexo a proposta completa de prestação de serviços com o laudo pericial atualizado e as fotos do imóvel.", description="Corpo do e-mail")
    attachments: List[AttachmentItem] = Field(default_factory=list, description="Lista de anexos do e-mail")
    plan: Optional[str] = Field("business", description="Plano do usuário (start ou business)")
    vip_senders: Optional[List[str]] = Field(default_factory=list, description="Lista de remetentes VIP do plano start")
    user_whatsapp: Optional[str] = Field("5511980000001", description="WhatsApp do usuário")

def triage_attachments(attachments: List[AttachmentItem]) -> Dict[str, Any]:
    """
    Executa a triagem dos anexos do e-mail:
    - Cenário 1: 1 único anexo <= 15 MB -> Envio direto.
    - Cenário 2: Múltiplos anexos ou total <= 60 MB -> Empacota em .zip.
    - Cenário 3: > 60 MB -> Link seguro de nuvem temporário (Cloudflare R2).
    """
    if not attachments:
        return {
            "mode": "text_only",
            "total_files": 0,
            "total_mb": 0.0,
            "display_name": None,
            "action_text": "Apenas texto (sem anexos)"
        }

    total_mb = sum(a.size_mb for a in attachments)
    total_files = len(attachments)

    # CENÁRIO 1: 1 anexo e <= 15 MB
    if total_files == 1 and total_mb <= LIMIT_DIRECT_MB:
        att = attachments[0]
        return {
            "mode": "direct_file",
            "total_files": 1,
            "total_mb": round(total_mb, 2),
            "display_name": att.name,
            "mime_type": att.mime_type,
            "action_text": f"Arquivo único ({round(total_mb, 2)} MB) enviado diretamente com legenda no WhatsApp."
        }

    # CENÁRIO 2: Múltiplos anexos ou tamanho total <= 60 MB -> Compacta em .zip
    if total_mb <= LIMIT_ZIP_MB:
        zip_name = f"Anexos_Email_{int(time.time())}.zip"
        estimated_zip_mb = round(total_mb * 0.85, 2) # Estimativa de compressão
        return {
            "mode": "packaged_zip",
            "total_files": total_files,
            "total_mb": round(total_mb, 2),
            "zip_mb": estimated_zip_mb,
            "display_name": zip_name,
            "action_text": f"{total_files} arquivos compactados automaticamente em '{zip_name}' ({estimated_zip_mb} MB) para evitar flood."
        }

    # CENÁRIO 3: Arquivos muito pesados (> 60 MB) -> Link temporário seguro Cloudflare R2
    token = hashlib.sha256(f"{time.time()}_{total_mb}".encode()).hexdigest()[:12]
    download_url = f"https://onmail.coon.com.br/d/{token}-expira-48h"
    return {
        "mode": "cloud_link",
        "total_files": total_files,
        "total_mb": round(total_mb, 2),
        "download_url": download_url,
        "expires_in_hours": 48,
        "action_text": f"Arquivos pesados ({round(total_mb, 2)} MB) salvos no Cloudflare R2. Link de download gerado com expiração de 48h."
    }

def format_whatsapp_message(
    sender: str,
    subject: str,
    body_text: str,
    triage: Dict[str, Any],
    is_vip: bool = False,
    is_digest: bool = False
) -> str:
    """
    Gera a mensagem do WhatsApp perfeitamente formatada para a Evolution API.
    """
    resumo = (body_text[:280] + "...") if len(body_text) > 280 else body_text
    
    if is_digest:
        return (
            "📊 *[OnMail] Resumo da Sua Caixa de Entrada (18h)*\n\n"
            f"Olá! Hoje você recebeu novas mensagens na sua conta corporativa:\n\n"
            f"• *Último e-mail:* {sender}\n"
            f"• *Assunto:* {subject}\n\n"
            f"💬 *Resumo:* {resumo}\n\n"
            "⚡ _Deseja receber cada e-mail em tempo real no seu WhatsApp? Faça upgrade para o OnMail Empresarial!_"
        )

    header = "📩 *Novo E-mail Recebido no OnMail!*"
    if is_vip:
        header = "⭐ *[VIP] E-mail Prioritário Recebido!*"

    lines = [
        header,
        "",
        f"*De:* {sender}",
        f"*Assunto:* {subject}",
        "",
        f"*Mensagem:*",
        f"{resumo}",
        ""
    ]

    mode = triage.get("mode")
    if mode == "direct_file":
        lines.append(f"📎 *Anexo Anexado:* {triage['display_name']} ({triage['total_mb']} MB)")
    elif mode == "packaged_zip":
        lines.append(f"📦 *Pacote Inteligente:* {triage['total_files']} anexos compactados em *{triage['display_name']}* ({triage['zip_mb']} MB)")
    elif mode == "cloud_link":
        lines.append(f"⚠️ *Anexos Pesados ({triage['total_mb']} MB):* Para não lotar a memória do seu aparelho, os arquivos estão salvos na nuvem:")
        lines.append(f"🔗 *Baixar Anexos Seguros (Expira em 48h):*")
        lines.append(f"{triage['download_url']}")

    lines.append("")
    lines.append("⚡ _Tecnologia OnMail • Coon Participações Ltda._")
    return "\n".join(lines)

def simulate_onmail_flow(req: EmailSimulationRequest) -> Dict[str, Any]:
    """
    Simula o ciclo completo de um e-mail recebido até o disparo no WhatsApp.
    """
    plan_id = req.plan or "business"
    plan_info = ONMAIL_PLANS.get(plan_id, ONMAIL_PLANS["business"])
    
    # Checagem de VIP se for plano gratuito
    sender_lower = req.sender.lower().strip()
    vip_list = [v.lower().strip() for v in (req.vip_senders or [])]
    is_vip = sender_lower in vip_list or any(v in sender_lower for v in vip_list) if vip_list else False
    
    should_dispatch_instant = True
    is_digest = False

    if plan_id == "start":
        # No plano gratuito, se não for VIP, vai para o Digest diário
        if vip_list and not is_vip:
            should_dispatch_instant = False
            is_digest = True

    triage = triage_attachments(req.attachments)
    wa_message = format_whatsapp_message(
        sender=req.sender,
        subject=req.subject,
        body_text=req.body_text,
        triage=triage,
        is_vip=is_vip,
        is_digest=is_digest
    )

    return {
        "success": True,
        "plan_used": plan_info["name"],
        "is_vip_sender": is_vip,
        "instant_dispatch": should_dispatch_instant,
        "delivery_channel": "WhatsApp (Evolution API Hetzner - R$ 0,00 Meta)",
        "triage": triage,
        "whatsapp_preview": wa_message,
        "estimated_savings_vs_meta": "Economia de R$ 0,05 por mensagem via motor próprio Coon"
    }
