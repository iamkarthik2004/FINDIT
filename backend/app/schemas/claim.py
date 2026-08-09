from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

ClaimStatus = Literal["pending", "approved", "rejected"]


class ClaimCreate(BaseModel):
    itemId: str
    message: str = Field(min_length=5, max_length=2000)


class ClaimStatusUpdate(BaseModel):
    status: ClaimStatus


class ClaimThankYou(BaseModel):
    message: str = Field(min_length=3, max_length=1000)


class ClaimResponse(BaseModel):
    id: str
    itemId: str
    claimantId: str
    message: str
    description: str
    status: ClaimStatus
    claimDate: datetime
    createdAt: datetime
    updatedAt: datetime
    itemTitle: str | None = None
    item: dict | None = None
    matchScore: int = 0
    claimantName: str | None = None
    claimantEmail: str | None = None
    thankYouMessage: str | None = None
