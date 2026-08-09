from datetime import datetime, timezone
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from app.core.database import get_db
from app.core.security import CurrentUser
from app.schemas.claim import ClaimCreate, ClaimResponse, ClaimStatusUpdate, ClaimThankYou
from app.services.item_service import parse_object_id, serialize_item
from app.services.matching_service import score_match

router = APIRouter(prefix="/api/claims", tags=["Claims"])
Db = Annotated[AsyncDatabase, Depends(get_db)]


async def serialize_claim(db: AsyncDatabase, claim: dict) -> dict:
    item = await db.items.find_one({"_id": claim["itemId"]})
    serialized_item = serialize_item(item) if item else None
    claimant = await db.users.find_one({"_id": claim["claimantId"]}, {"name": 1, "email": 1})
    return {"id": str(claim["_id"]), "itemId": str(claim["itemId"]), "claimantId": str(claim["claimantId"]), "message": claim["message"], "description": claim["message"], "status": claim["status"], "claimDate": claim["createdAt"], "createdAt": claim["createdAt"], "updatedAt": claim["updatedAt"], "itemTitle": item.get("title") if item else None, "item": serialized_item, "matchScore": item.get("matchScore", 0) if item else 0, "claimantName": claimant.get("name") if claimant else None, "claimantEmail": claimant.get("email") if claimant else None, "thankYouMessage": claim.get("thankYouMessage")}


async def get_claim_or_404(db: AsyncDatabase, claim_id: str) -> dict:
    oid = parse_object_id(claim_id)
    claim = await db.claims.find_one({"_id": oid}) if oid else None
    if not claim: raise HTTPException(status_code=404, detail="Claim not found")
    return claim


@router.post("", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED, summary="Claim a found item")
async def create_claim(payload: ClaimCreate, db: Db, current_user: CurrentUser) -> dict:
    item_id = parse_object_id(payload.itemId)
    item = await db.items.find_one({"_id": item_id}) if item_id else None
    if not item: raise HTTPException(status_code=404, detail="Item not found")
    if item["type"] != "found": raise HTTPException(status_code=400, detail="Only found items can be claimed")
    if item["userId"] == current_user["_id"]: raise HTTPException(status_code=400, detail="You cannot claim your own item")
    duplicate = await db.claims.find_one({"itemId": item_id, "claimantId": current_user["_id"], "status": "pending"})
    if duplicate: raise HTTPException(status_code=409, detail="You already have a pending claim for this item")
    now = datetime.now(timezone.utc)
    claim = {"itemId": item_id, "claimantId": current_user["_id"], "message": payload.message, "status": "pending", "createdAt": now, "updatedAt": now}
    result = await db.claims.insert_one(claim)
    claim["_id"] = result.inserted_id
    await db.items.update_one({"_id": item_id}, {"$set": {"status": "claim_pending", "updatedAt": now}})
    return await serialize_claim(db, claim)


@router.get("/my", response_model=list[ClaimResponse], summary="Get the current user's claims")
async def my_claims(db: Db, current_user: CurrentUser) -> list[dict]:
    claims = await db.claims.find({"claimantId": current_user["_id"]}).sort("createdAt", -1).to_list(length=500)
    return [await serialize_claim(db, claim) for claim in claims]


@router.get("/received", response_model=list[ClaimResponse], summary="Get claims on the current user's found reports")
async def received_claims(db: Db, current_user: CurrentUser) -> list[dict]:
    owned_items = await db.items.find({"userId": current_user["_id"], "type": "found"}, {"_id": 1}).to_list(length=500)
    item_ids = [item["_id"] for item in owned_items]
    if not item_ids:
        return []
    claims = await db.claims.find({"itemId": {"$in": item_ids}}).sort("createdAt", -1).to_list(length=500)
    return [await serialize_claim(db, claim) for claim in claims]


@router.get("/{claim_id}", response_model=ClaimResponse, summary="Get one claim")
async def get_claim(claim_id: str, db: Db, current_user: CurrentUser) -> dict:
    claim = await get_claim_or_404(db, claim_id)
    if claim["claimantId"] != current_user["_id"] and current_user["role"] != "admin": raise HTTPException(status_code=403, detail="You cannot view this claim")
    return await serialize_claim(db, claim)


@router.put("/{claim_id}/status", response_model=ClaimResponse, summary="Accept or reject a claim on your found item")
async def update_received_claim(claim_id: str, payload: ClaimStatusUpdate, db: Db, current_user: CurrentUser) -> dict:
    claim = await get_claim_or_404(db, claim_id)
    item = await db.items.find_one({"_id": claim["itemId"]})
    if not item or (item["userId"] != current_user["_id"] and current_user["role"] != "admin"):
        raise HTTPException(status_code=403, detail="Only the found-item reporter can review this claim")
    if claim["status"] != "pending":
        raise HTTPException(status_code=400, detail="This claim has already been reviewed")

    now = datetime.now(timezone.utc)
    await db.claims.update_one({"_id": claim["_id"]}, {"$set": {"status": payload.status, "updatedAt": now}})
    if payload.status == "approved":
        await db.items.update_one({"_id": item["_id"]}, {"$set": {"status": "returned", "updatedAt": now}})
    else:
        pending = await db.claims.count_documents({"itemId": item["_id"], "status": "pending"})
        if pending == 0:
            await db.items.update_one({"_id": item["_id"]}, {"$set": {"status": "active", "updatedAt": now}})
    claim.update({"status": payload.status, "updatedAt": now})
    return await serialize_claim(db, claim)


@router.put("/{claim_id}/thank-you", response_model=ClaimResponse, summary="Confirm receipt and thank the finder")
async def thank_finder(claim_id: str, payload: ClaimThankYou, db: Db, current_user: CurrentUser) -> dict:
    claim = await get_claim_or_404(db, claim_id)
    if claim["claimantId"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Only the claimant can confirm receipt")
    if claim["status"] != "approved":
        raise HTTPException(status_code=400, detail="The claim must be approved before confirming receipt")
    now = datetime.now(timezone.utc)
    await db.claims.update_one({"_id": claim["_id"]}, {"$set": {"thankYouMessage": payload.message, "updatedAt": now}})
    claim.update({"thankYouMessage": payload.message, "updatedAt": now})
    return await serialize_claim(db, claim)


@router.delete("/{claim_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Withdraw your pending claim")
async def withdraw_claim(claim_id: str, db: Db, current_user: CurrentUser) -> None:
    claim = await get_claim_or_404(db, claim_id)
    if claim["claimantId"] != current_user["_id"]: raise HTTPException(status_code=403, detail="You cannot withdraw this claim")
    if claim["status"] != "pending": raise HTTPException(status_code=400, detail="Only pending claims can be withdrawn")
    await db.claims.delete_one({"_id": claim["_id"]})
