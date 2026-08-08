from datetime import datetime, timezone
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from app.core.database import get_db
from app.core.security import CurrentUser
from app.schemas.chat import ChatCreate, ChatResponse, MessageCreate, MessageResponse
from app.services.item_service import parse_object_id, serialize_item

router = APIRouter(prefix="/api/chats", tags=["Chats"])
Db = Annotated[AsyncDatabase, Depends(get_db)]


def chat_id(value: str) -> ObjectId:
    oid = parse_object_id(value)
    if not oid:
        raise HTTPException(status_code=404, detail="Chat not found")
    return oid


async def get_participant_chat(db: AsyncDatabase, value: str, current_user: dict) -> dict:
    chat = await db.chats.find_one({"_id": chat_id(value)})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if current_user["_id"] not in chat["participants"]:
        raise HTTPException(status_code=403, detail="You are not a participant in this chat")
    return chat


async def serialize_chat(db: AsyncDatabase, chat: dict, current_user: dict) -> dict:
    item = await db.items.find_one({"_id": chat["itemId"]}) if chat.get("itemId") else None
    other_id = next((user_id for user_id in chat["participants"] if user_id != current_user["_id"]), current_user["_id"])
    other = await db.users.find_one({"_id": other_id}, {"name": 1, "email": 1, "role": 1})
    unread = await db.messages.count_documents({"chatId": chat["_id"], "senderId": {"$ne": current_user["_id"]}, "read": False})
    return {
        "id": str(chat["_id"]), "itemId": str(chat["itemId"]) if chat.get("itemId") else None,
        "item": serialize_item(item) if item else None,
        "participant": {"id": str(other["_id"]), "name": other.get("name"), "email": other.get("email"), "role": other.get("role")} if other else None,
        "lastMessage": chat.get("lastMessage"), "lastMessageAt": chat.get("lastMessageAt"),
        "unreadCount": unread, "createdAt": chat["createdAt"],
    }


async def serialize_message(db: AsyncDatabase, message: dict) -> dict:
    sender = await db.users.find_one({"_id": message["senderId"]}, {"name": 1})
    return {"id": str(message["_id"]), "chatId": str(message["chatId"]), "senderId": str(message["senderId"]), "senderName": sender.get("name", "FINDIT user") if sender else "FINDIT user", "message": message["message"], "createdAt": message["createdAt"], "read": message.get("read", False)}


@router.post("", response_model=ChatResponse, status_code=status.HTTP_201_CREATED, summary="Create or retrieve an item chat")
async def create_or_get_chat(payload: ChatCreate, db: Db, current_user: CurrentUser) -> dict:
    item_id = parse_object_id(payload.itemId) if payload.itemId else None
    item = await db.items.find_one({"_id": item_id}) if item_id else None
    if payload.itemId and not item:
        raise HTTPException(status_code=404, detail="Item not found")
    participant_id = parse_object_id(payload.participantId) if payload.participantId else (item["userId"] if item else None)
    participant = await db.users.find_one({"_id": participant_id}, {"_id": 1}) if participant_id else None
    if not participant:
        raise HTTPException(status_code=422, detail="Choose a user to start this chat")
    if participant_id == current_user["_id"]:
        raise HTTPException(status_code=400, detail="You cannot chat with yourself")
    participants = [participant_id, current_user["_id"]]
    chat_query = {"participants": {"$all": participants}}
    if item_id:
        chat_query["itemId"] = item_id
    else:
        chat_query["itemId"] = None
    chat = await db.chats.find_one(chat_query)
    if not chat:
        now = datetime.now(timezone.utc)
        chat = {"itemId": item_id, "participants": participants, "createdAt": now, "lastMessage": None, "lastMessageAt": None}
        result = await db.chats.insert_one(chat)
        chat["_id"] = result.inserted_id
    return await serialize_chat(db, chat, current_user)


@router.get("/contacts", summary="List users available for a direct chat")
async def contacts(db: Db, current_user: CurrentUser) -> list[dict]:
    users = await db.users.find({"_id": {"$ne": current_user["_id"]}}, {"name": 1, "email": 1, "role": 1}).sort("name", 1).to_list(length=500)
    return [{"id": str(user["_id"]), "name": user["name"], "email": user["email"], "role": user.get("role", "student")} for user in users]


@router.get("", response_model=list[ChatResponse], summary="List the current user's chats")
async def list_chats(db: Db, current_user: CurrentUser) -> list[dict]:
    chats = await db.chats.find({"participants": current_user["_id"]}).sort([("lastMessageAt", -1), ("createdAt", -1)]).to_list(length=500)
    return [await serialize_chat(db, chat, current_user) for chat in chats]


@router.get("/unread-count", summary="Get unread chat count")
async def unread_count(db: Db, current_user: CurrentUser) -> dict:
    user_chats = await db.chats.find({"participants": current_user["_id"]}, {"_id": 1}).to_list(length=500)
    chat_ids = [chat["_id"] for chat in user_chats]
    count = await db.messages.count_documents({"chatId": {"$in": chat_ids}, "senderId": {"$ne": current_user["_id"]}, "read": False}) if chat_ids else 0
    return {"count": count}


@router.get("/{value}", response_model=ChatResponse, summary="Get one participant chat")
async def get_chat(value: str, db: Db, current_user: CurrentUser) -> dict:
    return await serialize_chat(db, await get_participant_chat(db, value, current_user), current_user)


@router.get("/{value}/messages", response_model=list[MessageResponse], summary="List chat messages")
async def list_messages(value: str, db: Db, current_user: CurrentUser) -> list[dict]:
    chat = await get_participant_chat(db, value, current_user)
    messages = await db.messages.find({"chatId": chat["_id"]}).sort("createdAt", 1).to_list(length=1000)
    return [await serialize_message(db, message) for message in messages]


@router.post("/{value}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED, summary="Send a chat message")
async def send_message(value: str, payload: MessageCreate, db: Db, current_user: CurrentUser) -> dict:
    chat = await get_participant_chat(db, value, current_user)
    now = datetime.now(timezone.utc)
    message = {"chatId": chat["_id"], "senderId": current_user["_id"], "message": payload.message.strip(), "createdAt": now, "read": False}
    result = await db.messages.insert_one(message)
    message["_id"] = result.inserted_id
    await db.chats.update_one({"_id": chat["_id"]}, {"$set": {"lastMessage": message["message"], "lastMessageAt": now}})
    return await serialize_message(db, message)


@router.put("/{value}/read", summary="Mark a chat read")
async def mark_read(value: str, db: Db, current_user: CurrentUser) -> dict:
    chat = await get_participant_chat(db, value, current_user)
    result = await db.messages.update_many({"chatId": chat["_id"], "senderId": {"$ne": current_user["_id"]}, "read": False}, {"$set": {"read": True}})
    return {"updated": result.modified_count}
