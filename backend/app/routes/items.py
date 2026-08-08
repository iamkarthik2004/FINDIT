from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo.asynchronous.database import AsyncDatabase

from app.core.database import get_db
from app.core.security import CurrentUser
from app.schemas.item import ItemCreate, ItemReceived, ItemResponse, ItemUpdate
from app.services.item_service import parse_object_id, serialize_item
from app.services.matching_service import match_metadata, score_match

router = APIRouter(tags=["Items"])
Db = Annotated[AsyncDatabase, Depends(get_db)]


async def get_item_or_404(db: AsyncDatabase, item_id: str) -> dict:
    oid = parse_object_id(item_id)
    item = await db.items.find_one({"_id": oid}) if oid else None
    if not item: raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.get("/api/items", response_model=list[ItemResponse], summary="Browse and search item reports")
async def list_items(db: Db, type: str | None = Query(None, pattern="^(lost|found)$"), category: str | None = None, location: str | None = None, search: str | None = None, status_filter: str | None = Query(None, alias="status"), page: int = Query(1, ge=1), limit: int = Query(30, ge=1, le=100)) -> list[dict]:
    query: dict = {}
    if type: query["type"] = type
    if category: query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    if location: query["location"] = {"$regex": f"^{location}$", "$options": "i"}
    if status_filter: query["status"] = status_filter.replace("-", "_")
    else: query["status"] = {"$nin": ["returned", "closed"]}
    if search:
        regex = {"$regex": search.strip(), "$options": "i"}
        query["$or"] = [{field: regex} for field in ("title", "description", "brand", "color", "category", "location")]
    docs = await db.items.find(query).sort("date", -1).skip((page - 1) * limit).limit(limit).to_list(length=limit)
    return [serialize_item(doc) for doc in docs]


@router.get("/api/items/{item_id}", response_model=ItemResponse, summary="Get item report details")
async def get_item(item_id: str, db: Db) -> dict:
    return serialize_item(await get_item_or_404(db, item_id))


@router.post("/api/items", response_model=ItemResponse, status_code=status.HTTP_201_CREATED, summary="Create a lost or found report")
async def create_item(payload: ItemCreate, db: Db, current_user: CurrentUser) -> dict:
    now = datetime.now(timezone.utc)
    document = payload.model_dump(mode="json") | {"userId": current_user["_id"], "status": "active", "reportedBy": current_user["name"], "reporterEmail": current_user["email"], "matchScore": 0, "createdAt": now, "updatedAt": now}
    result = await db.items.insert_one(document)
    document["_id"] = result.inserted_id
    return serialize_item(document)


@router.put("/api/items/{item_id}", response_model=ItemResponse, summary="Update your item report")
async def update_item(item_id: str, payload: ItemUpdate, db: Db, current_user: CurrentUser) -> dict:
    item = await get_item_or_404(db, item_id)
    if item["userId"] != current_user["_id"] and current_user["role"] != "admin": raise HTTPException(status_code=403, detail="You cannot edit this item")
    updates = payload.model_dump(exclude_unset=True, mode="json")
    if updates:
        updates["updatedAt"] = datetime.now(timezone.utc)
        await db.items.update_one({"_id": item["_id"]}, {"$set": updates})
        item.update(updates)
    return serialize_item(item)


@router.put("/api/items/{item_id}/received", response_model=ItemResponse, summary="Mark your lost item as recovered")
async def mark_item_received(item_id: str, payload: ItemReceived, db: Db, current_user: CurrentUser) -> dict:
    item = await get_item_or_404(db, item_id)
    if item["userId"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Only the lost-item reporter can mark it as received")
    if item["type"] != "lost":
        raise HTTPException(status_code=400, detail="Only lost reports can be marked as received")
    if item["status"] == "returned":
        raise HTTPException(status_code=400, detail="This report is already marked as received")
    now = datetime.now(timezone.utc)
    await db.items.update_one({"_id": item["_id"]}, {"$set": {"status": "returned", "returnMessage": payload.message, "updatedAt": now}})
    item.update({"status": "returned", "returnMessage": payload.message, "updatedAt": now})
    return serialize_item(item)


@router.delete("/api/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete your item report")
async def delete_item(item_id: str, db: Db, current_user: CurrentUser) -> None:
    item = await get_item_or_404(db, item_id)
    if item["userId"] != current_user["_id"] and current_user["role"] != "admin": raise HTTPException(status_code=403, detail="You cannot delete this item")
    await db.items.delete_one({"_id": item["_id"]})


@router.get("/api/users/me/items", response_model=list[ItemResponse], summary="Get the current user's reports")
async def my_items(db: Db, current_user: CurrentUser) -> list[dict]:
    docs = await db.items.find({"userId": current_user["_id"]}).sort("createdAt", -1).to_list(length=500)
    return [serialize_item(doc) for doc in docs]


@router.get("/api/items/{item_id}/matches", summary="Find opposite-type item matches")
async def find_matches(item_id: str, db: Db) -> dict:
    source = await get_item_or_404(db, item_id)
    candidates = await db.items.find({"type": "found" if source["type"] == "lost" else "lost", "status": {"$in": ["active", "possible_match", "claim_pending"]}, "$or": [{"category": source["category"]}, {"location": source["location"]}]}).limit(100).to_list(length=100)
    matches = []
    for candidate in candidates:
        score = score_match(source, candidate)
        if score >= 30:
            matches.append(serialize_item(candidate) | match_metadata(score))
    matches.sort(key=lambda result: result["matchScore"], reverse=True)
    return {"matches": matches[:10], "matchType": "rule_based"}
