from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from lib.db import db
from models.deal import Deal, DealCreate, DealUpdate, DealStageUpdate
from datetime import datetime, timezone

router = APIRouter(prefix="/deals", tags=["deals"])

def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

@router.get("", response_model=List[Deal])
async def get_deals(
    search: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("updated_at"),
    order: Optional[str] = Query("desc")
):
    query = {}
    if stage and stage != "All":
        query["stage"] = stage
    if sector and sector != "All":
        query["sector"] = sector
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"target_company": {"$regex": search, "$options": "i"}},
            {"lead_partner": {"$regex": search, "$options": "i"}},
            {"sector": {"$regex": search, "$options": "i"}}
        ]
    
    cursor = db.deals.find(query, {"_id": 0})
    sort_direction = -1 if order == "desc" else 1
    cursor = cursor.sort(sort_by, sort_direction)
    docs = await cursor.to_list(1000)
    return [Deal(**doc) for doc in docs]

@router.get("/{id}", response_model=Deal)
async def get_deal(id: str):
    doc = await db.deals.find_one({"id": id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Deal not found")
    return Deal(**doc)

@router.post("", response_model=Deal, status_code=201)
async def create_deal(payload: DealCreate):
    deal_dict = payload.model_dump()
    
    # Auto-calculate multiple if ebitda > 0
    if deal_dict.get("ebitda") and deal_dict["ebitda"] > 0:
        deal_dict["ebitda_multiple"] = round(deal_dict["enterprise_value"] / deal_dict["ebitda"], 2)
    elif not deal_dict.get("ebitda_multiple"):
        deal_dict["ebitda_multiple"] = 0.0

    deal = Deal(**deal_dict)
    deal_data = deal.model_dump()
    await db.deals.insert_one(deal_data)
    return deal

@router.put("/{id}", response_model=Deal)
async def update_deal(id: str, payload: DealUpdate):
    doc = await db.deals.find_one({"id": id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    
    # Recalculate multiple if EV or EBITDA changed
    ev = update_data.get("enterprise_value", doc.get("enterprise_value", 0))
    ebitda = update_data.get("ebitda", doc.get("ebitda", 0))
    if ebitda and ebitda > 0:
        update_data["ebitda_multiple"] = round(ev / ebitda, 2)
    
    update_data["updated_at"] = utc_now_iso()
    
    await db.deals.update_one({"id": id}, {"$set": update_data})
    updated_doc = await db.deals.find_one({"id": id}, {"_id": 0})
    return Deal(**updated_doc)

@router.patch("/{id}/stage", response_model=Deal)
async def update_deal_stage(id: str, payload: DealStageUpdate):
    doc = await db.deals.find_one({"id": id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    update_data = {
        "stage": payload.stage,
        "updated_at": utc_now_iso()
    }
    
    # If moved to Closed Won, adjust probability
    if payload.stage == "Closed Won":
        update_data["probability_pct"] = 100
    elif payload.stage == "Passed":
        update_data["probability_pct"] = 0
        
    await db.deals.update_one({"id": id}, {"$set": update_data})
    updated_doc = await db.deals.find_one({"id": id}, {"_id": 0})
    return Deal(**updated_doc)

@router.delete("/{id}")
async def delete_deal(id: str):
    res = await db.deals.delete_one({"id": id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Deal not found")
    return {"message": "Deal deleted successfully", "id": id}
