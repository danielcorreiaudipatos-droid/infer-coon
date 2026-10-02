"""
🤝 TEAM COLLABORATION MODULE - ADS Inteligente Premium

Funcionalidades:
- Convite de membros da equipe
- Gestão de roles e permissões
- Audit log (rastreamento de tudo)
- Approval workflow (Draft → Review → Publish)
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict
from sqlalchemy import Column, Integer, String, JSON, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Session
from enum import Enum
import uuid

# Models

class TeamRole(str, Enum):
    ADMIN = "admin"           # Full access
    MANAGER = "manager"       # Create/edit/approve
    EDITOR = "editor"         # Create/edit only
    VIEWER = "viewer"         # Read-only


class TeamMember:
    """Membro da equipe com roles e permissões"""

    def __init__(self, user_id: int, account_id: int, role: TeamRole,
                 invited_by: int, permissions: Dict = None):
        self.id = str(uuid.uuid4())
        self.user_id = user_id
        self.account_id = account_id
        self.role = role
        self.invited_by = invited_by
        self.permissions = permissions or self._default_permissions(role)
        self.invited_at = datetime.utcnow()
        self.accepted_at = None
        self.status = "pending"  # pending, accepted, rejected, inactive


class AuditLog:
    """Rastreamento completo de todas as ações"""

    def __init__(self, account_id: int, user_id: int, action: str,
                 resource: str, resource_id: int, changes: Dict = None,
                 ip_address: str = None):
        self.id = str(uuid.uuid4())
        self.account_id = account_id
        self.user_id = user_id
        self.action = action  # create, update, pause, delete, approve, reject
        self.resource = resource  # campaign, budget, settings, user, etc
        self.resource_id = resource_id
        self.changes = changes or {}  # {field: {from: old, to: new}}
        self.ip_address = ip_address
        self.timestamp = datetime.utcnow()

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "resource": self.resource,
            "resource_id": self.resource_id,
            "changes": self.changes,
            "timestamp": self.timestamp.isoformat(),
            "ip_address": self.ip_address
        }


class ApprovalWorkflow:
    """Workflow de aprovação para campanhas"""

    def __init__(self, campaign_id: int, created_by: int):
        self.id = str(uuid.uuid4())
        self.campaign_id = campaign_id
        self.created_by = created_by
        self.status = "draft"  # draft → pending_review → approved → published
        self.submitted_at = None
        self.reviewed_by = None
        self.reviewed_at = None
        self.comments = ""
        self.created_at = datetime.utcnow()
        self.version = 1

    def submit_for_review(self, submitted_by: int):
        """Submeter campanha para aprovação"""
        self.status = "pending_review"
        self.submitted_at = datetime.utcnow()
        return True

    def approve(self, reviewer_id: int, comments: str = ""):
        """Aprovar campanha"""
        if self.status != "pending_review":
            return False

        self.status = "approved"
        self.reviewed_by = reviewer_id
        self.reviewed_at = datetime.utcnow()
        self.comments = comments
        return True

    def reject(self, reviewer_id: int, comments: str):
        """Rejeitar e enviar de volta para edição"""
        if self.status != "pending_review":
            return False

        self.status = "draft"
        self.reviewed_by = reviewer_id
        self.reviewed_at = datetime.utcnow()
        self.comments = comments
        self.version += 1
        return True

    def publish(self):
        """Publicar campanha aprovada"""
        if self.status != "approved":
            return False

        self.status = "published"
        return True


# Service Layer

class TeamCollaborationService:
    """Serviço de gerenciamento de equipe"""

    def __init__(self, db: Session):
        self.db = db
        self.audit_log = []

    def invite_team_member(self, account_id: int, email: str, role: TeamRole,
                          invited_by: int, permissions: Dict = None) -> Dict:
        """Convidar novo membro da equipe"""

        # Validações
        if role == TeamRole.ADMIN:
            # Só admin atual pode adicionar novo admin
            if not self._is_admin(account_id, invited_by):
                return {"success": False, "error": "Apenas admins podem adicionar admins"}

        # Criar convite
        member = TeamMember(
            user_id=0,  # Será preenchido quando aceitar
            account_id=account_id,
            role=role,
            invited_by=invited_by,
            permissions=permissions
        )

        # Log de auditoria
        self._log_action(
            account_id, invited_by,
            "invite_team_member",
            "team_member", member.id,
            {"role": role, "email": email}
        )

        # TODO: Enviar email de convite
        # send_invitation_email(email, account_id, member.id)

        return {
            "success": True,
            "member_id": member.id,
            "email": email,
            "role": role,
            "status": "invitation_sent"
        }

    def list_team_members(self, account_id: int) -> List[Dict]:
        """Listar todos os membros da equipe"""
        members = []  # SELECT * FROM team_members WHERE account_id = ?
        return [m.to_dict() for m in members]

    def update_member_role(self, account_id: int, member_id: str,
                          new_role: TeamRole, updated_by: int) -> Dict:
        """Atualizar role de um membro"""

        # Validação: só admin pode mudar roles
        if not self._is_admin(account_id, updated_by):
            return {"success": False, "error": "Apenas admins podem mudar roles"}

        # Log de auditoria
        self._log_action(
            account_id, updated_by,
            "update_member_role",
            "team_member", member_id,
            {"old_role": "previous_role", "new_role": new_role}
        )

        return {"success": True, "member_id": member_id, "new_role": new_role}

    def remove_team_member(self, account_id: int, member_id: str,
                          removed_by: int) -> Dict:
        """Remover membro da equipe"""

        if not self._is_admin(account_id, removed_by):
            return {"success": False, "error": "Apenas admins podem remover membros"}

        # Log de auditoria
        self._log_action(
            account_id, removed_by,
            "remove_team_member",
            "team_member", member_id,
            {}
        )

        return {"success": True, "member_id": member_id}

    # Approval Workflow

    def submit_campaign_for_review(self, account_id: int, campaign_id: int,
                                   submitted_by: int) -> Dict:
        """Submeter campanha para revisão"""

        workflow = ApprovalWorkflow(campaign_id, submitted_by)
        workflow.submit_for_review(submitted_by)

        # Log
        self._log_action(
            account_id, submitted_by,
            "submit_for_review",
            "campaign", campaign_id,
            {"status": "pending_review"}
        )

        return {
            "success": True,
            "workflow_id": workflow.id,
            "status": workflow.status
        }

    def approve_campaign(self, account_id: int, campaign_id: int,
                        approved_by: int, comments: str = "") -> Dict:
        """Aprovar campanha"""

        # Validação: só managers/admins podem aprovar
        if not self._can_approve(account_id, approved_by):
            return {"success": False, "error": "Sem permissão para aprovar"}

        # TODO: Get workflow from DB
        workflow = None  # ApprovalWorkflow.get(campaign_id)

        if not workflow or not workflow.approve(approved_by, comments):
            return {"success": False, "error": "Não pode aprovar neste estado"}

        # Log
        self._log_action(
            account_id, approved_by,
            "approve_campaign",
            "campaign", campaign_id,
            {"status": "approved", "comments": comments}
        )

        return {
            "success": True,
            "campaign_id": campaign_id,
            "status": "approved"
        }

    def reject_campaign(self, account_id: int, campaign_id: int,
                       rejected_by: int, comments: str) -> Dict:
        """Rejeitar campanha e enviar de volta para edição"""

        if not self._can_approve(account_id, rejected_by):
            return {"success": False, "error": "Sem permissão para rejeitar"}

        # TODO: Get workflow
        workflow = None  # ApprovalWorkflow.get(campaign_id)

        if not workflow or not workflow.reject(rejected_by, comments):
            return {"success": False, "error": "Não pode rejeitar neste estado"}

        # Log
        self._log_action(
            account_id, rejected_by,
            "reject_campaign",
            "campaign", campaign_id,
            {"status": "draft", "comments": comments, "version": workflow.version}
        )

        return {
            "success": True,
            "campaign_id": campaign_id,
            "status": "draft",
            "version": workflow.version
        }

    def publish_campaign(self, account_id: int, campaign_id: int,
                        published_by: int) -> Dict:
        """Publicar campanha aprovada"""

        # TODO: Get workflow
        workflow = None  # ApprovalWorkflow.get(campaign_id)

        if not workflow or workflow.status != "approved":
            return {"success": False, "error": "Campanha não foi aprovada"}

        # Atualizar campanha para "published"
        # campaign.status = "published"
        # db.commit()

        # Log
        self._log_action(
            account_id, published_by,
            "publish_campaign",
            "campaign", campaign_id,
            {"status": "published"}
        )

        return {
            "success": True,
            "campaign_id": campaign_id,
            "status": "published"
        }

    # Audit Log

    def get_audit_log(self, account_id: int, limit: int = 100,
                     offset: int = 0) -> List[Dict]:
        """Buscar audit log da conta"""
        logs = []  # SELECT * FROM audit_log WHERE account_id = ? LIMIT ? OFFSET ?
        return [log.to_dict() for log in logs]

    def get_audit_log_for_user(self, account_id: int, user_id: int) -> List[Dict]:
        """Buscar todas as ações de um usuário"""
        logs = []  # SELECT * FROM audit_log WHERE account_id = ? AND user_id = ?
        return [log.to_dict() for log in logs]

    def get_audit_log_for_campaign(self, account_id: int, campaign_id: int) -> List[Dict]:
        """Buscar histórico completo de uma campanha"""
        logs = []  # SELECT * FROM audit_log WHERE account_id = ? AND resource_id = ?
        return [log.to_dict() for log in logs]

    # Helpers

    def _is_admin(self, account_id: int, user_id: int) -> bool:
        """Verificar se usuário é admin"""
        # member = TeamMember.get(account_id, user_id)
        # return member and member.role == TeamRole.ADMIN
        return True  # TODO: Implement

    def _can_approve(self, account_id: int, user_id: int) -> bool:
        """Verificar se usuário pode aprovar"""
        # member = TeamMember.get(account_id, user_id)
        # return member and member.role in [TeamRole.ADMIN, TeamRole.MANAGER]
        return True  # TODO: Implement

    def _log_action(self, account_id: int, user_id: int, action: str,
                   resource: str, resource_id: int, changes: Dict = None,
                   ip_address: str = None):
        """Registrar ação no audit log"""
        log = AuditLog(account_id, user_id, action, resource, resource_id,
                      changes, ip_address)
        # db.add(log)
        # db.commit()

    def _default_permissions(self, role: TeamRole) -> Dict:
        """Permissões padrão por role"""
        permissions = {
            TeamRole.ADMIN: {
                "view_campaigns": True,
                "create_campaigns": True,
                "edit_campaigns": True,
                "delete_campaigns": True,
                "approve_campaigns": True,
                "manage_budget": True,
                "manage_team": True,
                "view_audit_log": True,
                "edit_settings": True
            },
            TeamRole.MANAGER: {
                "view_campaigns": True,
                "create_campaigns": True,
                "edit_campaigns": True,
                "delete_campaigns": False,
                "approve_campaigns": True,
                "manage_budget": True,
                "manage_team": False,
                "view_audit_log": True,
                "edit_settings": False
            },
            TeamRole.EDITOR: {
                "view_campaigns": True,
                "create_campaigns": True,
                "edit_campaigns": True,
                "delete_campaigns": False,
                "approve_campaigns": False,
                "manage_budget": False,
                "manage_team": False,
                "view_audit_log": False,
                "edit_settings": False
            },
            TeamRole.VIEWER: {
                "view_campaigns": True,
                "create_campaigns": False,
                "edit_campaigns": False,
                "delete_campaigns": False,
                "approve_campaigns": False,
                "manage_budget": False,
                "manage_team": False,
                "view_audit_log": False,
                "edit_settings": False
            }
        }
        return permissions.get(role, {})
