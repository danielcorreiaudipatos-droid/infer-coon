"""Notificações de pendência (item 5). Simples: registra em log e webhook,
sem depender de Twilio/SendGrid. Pronto pra conectar a um serviço depois."""

import time
from typing import Optional


def notificar_pendencia(entidade_tipo: str, entidade_id: int, usuario_email: str, tipo_doc: str):
    """Log + webhook vazio (pronto pra chamada real depois)."""
    msg = f"[PENDÊNCIA] {entidade_tipo}#{entidade_id}: documento '{tipo_doc}' aguardando. Notificar: {usuario_email}"
    print(msg)


def notificar_rejeicao(entidade_tipo: str, entidade_id: int, usuario_email: str, tipo_doc: str, motivo: str):
    """Log + webhook vazio."""
    msg = f"[REJEIÇÃO] {entidade_tipo}#{entidade_id}: documento '{tipo_doc}' rejeitado. Motivo: {motivo}. Notificar: {usuario_email}"
    print(msg)
