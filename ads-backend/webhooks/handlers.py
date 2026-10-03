"""Webhook handlers para eventos de ads"""
from fastapi import APIRouter, Request
router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/google")
async def google_webhook(request: Request):
    """Google Ads eventos"""
    data = await request.json()
    # TODO: Processar evento
    return {"status": "received"}

@router.post("/meta")
async def meta_webhook(request: Request):
    """Meta Ads eventos"""
    data = await request.json()
    # TODO: Processar evento
    return {"status": "received"}

@router.post("/linkedin")
async def linkedin_webhook(request: Request):
    """LinkedIn Ads eventos"""
    data = await request.json()
    # TODO: Processar evento
    return {"status": "received"}
