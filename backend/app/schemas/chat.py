from datetime import datetime

from pydantic import BaseModel, Field


class ChatCreate(BaseModel):
    itemId: str | None = None
    participantId: str | None = None


class MessageCreate(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class MessageResponse(BaseModel):
    id: str
    chatId: str
    senderId: str
    senderName: str
    message: str
    createdAt: datetime
    read: bool


class ChatResponse(BaseModel):
    id: str
    itemId: str | None = None
    item: dict | None = None
    participant: dict | None = None
    lastMessage: str | None = None
    lastMessageAt: datetime | None = None
    unreadCount: int = 0
    createdAt: datetime
