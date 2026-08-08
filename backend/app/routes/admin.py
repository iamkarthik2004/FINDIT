from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pymongo.asynchronous.database import AsyncDatabase

from app.core.database import get_db
from app.core.security import CurrentAdmin
from app.routes.claims import get_claim_or_404, serialize_claim
from app.routes.items import get_item_or_404
from app.schemas.claim import ClaimStatusUpdate
from app.schemas.item import StatusUpdate
from app.services.item_service import serialize_item

router = APIRouter(prefix="/api/admin", tags=["Administration"])
Db = Annotated[AsyncDatabase, Depends(get_db)]


@router.get("/stats", summary="Get dashboard statistics")
async def stats(db: Db, _: CurrentAdmin) -> dict:
    counts = await db.items.aggregate([{"$group": {"_id": None, "totalItems": {"$sum": 1}, "lostItems": {"$sum": {"$cond": [{"$eq": ["$type", "lost"]}, 1, 0]}}, "foundItems": {"$sum": {"$cond": [{"$eq": ["$type", "found"]}, 1, 0]}}, "returnedItems": {"$sum": {"$cond": [{"$eq": ["$status", "returned"]}, 1, 0]}}, "activeItems": {"$sum": {"$cond": [{"$eq": ["$status", "active"]}, 1, 0]}}}}]).to_list(1)
    result = counts[0] if counts else {"totalItems": 0, "lostItems": 0, "foundItems": 0, "returnedItems": 0, "activeItems": 0}
    result.pop("_id", None)
    result["pendingClaims"] = await db.claims.count_documents({"status": "pending"})
    start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=6)
    weekly = await db.items.aggregate([
        {"$match": {"createdAt": {"$gte": start}}},
        {"$group": {"_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}}, "reports": {"$sum": 1}}},
    ]).to_list(7)
    weekly_counts = {entry["_id"]: entry["reports"] for entry in weekly}
    result["weeklyReports"] = [
        {"label": (start + timedelta(days=offset)).strftime("%a"), "reports": weekly_counts.get((start + timedelta(days=offset)).strftime("%Y-%m-%d"), 0)}
        for offset in range(7)
    ]
    categories = await db.items.aggregate([
        {"$group": {"_id": "$category", "value": {"$sum": 1}}},
        {"$sort": {"value": -1, "_id": 1}},
    ]).to_list(50)
    result["categoryDistribution"] = [{"label": row["_id"] or "Other", "value": row["value"]} for row in categories]
    return result


@router.get("/users", summary="List registered users")
async def admin_users(db: Db, _: CurrentAdmin) -> list[dict]:
    users = await db.users.find({}, {"password_hash": 0}).sort("createdAt", -1).to_list(1000)
    report_counts = await db.items.aggregate([{"$group": {"_id": "$userId", "items": {"$sum": 1}}}]).to_list(1000)
    counts = {str(row["_id"]): row["items"] for row in report_counts}
    return [
        {"id": str(user["_id"]), "name": user["name"], "email": user["email"], "role": user.get("role", "student"), "items": counts.get(str(user["_id"]), 0), "createdAt": user["createdAt"]}
        for user in users
    ]


@router.get("/items", summary="List every report")
async def admin_items(db: Db, _: CurrentAdmin) -> list[dict]:
    docs = await db.items.find().sort("createdAt", -1).to_list(1000)
    return [serialize_item(doc) for doc in docs]


@router.get("/claims", summary="List every claim")
async def admin_claims(db: Db, _: CurrentAdmin) -> list[dict]:
    docs = await db.claims.find().sort("createdAt", -1).to_list(1000)
    return [await serialize_claim(db, doc) for doc in docs]


@router.put("/claims/{claim_id}", summary="Approve or reject a claim")
async def update_claim(claim_id: str, payload: ClaimStatusUpdate, db: Db, _: CurrentAdmin) -> dict:
    claim = await get_claim_or_404(db, claim_id)
    now = datetime.now(timezone.utc)
    await db.claims.update_one({"_id": claim["_id"]}, {"$set": {"status": payload.status, "updatedAt": now}})
    if payload.status == "approved": await db.items.update_one({"_id": claim["itemId"]}, {"$set": {"status": "returned", "updatedAt": now}})
    if payload.status == "rejected":
        pending = await db.claims.count_documents({"itemId": claim["itemId"], "status": "pending"})
        if pending == 0:
            await db.items.update_one({"_id": claim["itemId"]}, {"$set": {"status": "active", "updatedAt": now}})
    claim.update({"status": payload.status, "updatedAt": now})
    return await serialize_claim(db, claim)


@router.put("/items/{item_id}/status", summary="Set an item's lifecycle status")
async def update_item_status(item_id: str, payload: StatusUpdate, db: Db, _: CurrentAdmin) -> dict:
    item = await get_item_or_404(db, item_id)
    now = datetime.now(timezone.utc)
    await db.items.update_one({"_id": item["_id"]}, {"$set": {"status": payload.status, "updatedAt": now}})
    item.update({"status": payload.status, "updatedAt": now})
    return serialize_item(item)


@router.delete("/items/{item_id}", status_code=204, summary="Remove an inappropriate report")
async def remove_item(item_id: str, db: Db, _: CurrentAdmin) -> None:
    item = await get_item_or_404(db, item_id)
    await db.items.delete_one({"_id": item["_id"]})
