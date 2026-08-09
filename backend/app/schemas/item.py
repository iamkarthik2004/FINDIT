from datetime import date as Date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

ItemType = Literal["lost", "found"]
ItemStatus = Literal["active", "possible_match", "claim_pending", "returned", "closed", "verified"]


class ItemCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    type: ItemType
    title: str = Field(min_length=2, max_length=160)
    category: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=20, max_length=3000)
    location: str = Field(min_length=1, max_length=160)
    date: Date
    brand: str = Field(default="—", max_length=100)
    color: str = Field(default="—", max_length=100)
    imageUrl: str | None = Field(default=None, max_length=2048)
    details: str = Field(default="", max_length=1000)


class ItemUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    title: str | None = Field(default=None, min_length=2, max_length=160)
    category: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, min_length=20, max_length=3000)
    location: str | None = Field(default=None, min_length=1, max_length=160)
    date: Date | None = None
    brand: str | None = Field(default=None, max_length=100)
    color: str | None = Field(default=None, max_length=100)
    imageUrl: str | None = Field(default=None, max_length=2048)
    details: str | None = Field(default=None, max_length=1000)


class ItemReceived(BaseModel):
    message: str = Field(min_length=3, max_length=1000)


class StatusUpdate(BaseModel):
    status: ItemStatus


class ItemResponse(BaseModel):
    id: str
    userId: str
    type: ItemType
    title: str
    category: str
    description: str
    location: str
    date: Date
    brand: str
    color: str
    imageUrl: str | None = None
    image: str | None = None
    gallery: list[str] = []
    details: str = ""
    status: str
    reportedBy: str
    reporterEmail: str | None = None
    matchScore: int = 0
    createdAt: datetime
    updatedAt: datetime
    returnMessage: str | None = None
