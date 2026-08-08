from collections.abc import AsyncGenerator

from fastapi import HTTPException, status
from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.server_api import ServerApi

from app.core.config import get_settings

settings = get_settings()
client: AsyncMongoClient | None = None


async def connect_to_mongo() -> None:
    global client
    if not settings.mongodb_uri:
        return
    client = AsyncMongoClient(
        settings.mongodb_uri,
        server_api=ServerApi("1"),
        serverSelectionTimeoutMS=5000,
    )
    await client.admin.command("ping")
    db = get_database()
    await db.users.create_index("email", unique=True)
    await db.login_events.create_index([("userId", 1), ("createdAt", -1)])
    await db.items.create_index([("type", 1), ("status", 1), ("date", -1)])
    await db.items.create_index([("userId", 1), ("createdAt", -1)])
    await db.claims.create_index([("itemId", 1), ("claimantId", 1), ("status", 1)])
    await db.chats.create_index([("participants", 1), ("lastMessageAt", -1)])
    await db.chats.create_index([("itemId", 1), ("participants", 1)], unique=True)
    await db.messages.create_index([("chatId", 1), ("createdAt", 1)])
    await db.messages.create_index([("chatId", 1), ("senderId", 1), ("read", 1)])


async def close_mongo_connection() -> None:
    if client:
        await client.close()


def get_database() -> AsyncDatabase:
    if client is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database is not configured")
    return client[settings.database_name]


async def get_db() -> AsyncGenerator[AsyncDatabase, None]:
    yield get_database()
