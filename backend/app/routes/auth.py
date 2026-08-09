from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from app.core.database import get_db
from app.core.security import CurrentUser, create_access_token, hash_password, verify_password
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
Db = Annotated[AsyncDatabase, Depends(get_db)]


def user_response(user: dict) -> dict:
    return {"id": str(user["_id"]), "name": user["name"], "email": user["email"], "department": user.get("department", "Not specified"), "year": user.get("year", "Not specified"), "role": user["role"], "createdAt": user["createdAt"]}


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED, summary="Register a student account")
async def register(payload: RegisterRequest, db: Db) -> dict:
    if await db.users.find_one({"email": payload.email}):
        raise HTTPException(status_code=409, detail="An account already exists for this email")
    now = datetime.now(timezone.utc)
    user = {"name": payload.name, "email": payload.email, "password_hash": hash_password(payload.password), "department": payload.department, "year": payload.year, "role": "student", "createdAt": now}
    result = await db.users.insert_one(user)
    user["_id"] = result.inserted_id
    return {"access_token": create_access_token(str(result.inserted_id)), "user": user_response(user)}


@router.post("/login", response_model=AuthResponse, summary="Log in with email and password")
async def login(payload: LoginRequest, db: Db) -> dict:
    user = await db.users.find_one({"email": str(payload.email).lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    now = datetime.now(timezone.utc)
    # Keep a small audit trail without ever storing a password or access token.
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"lastLoginAt": now}})
    await db.login_events.insert_one({"userId": user["_id"], "email": user["email"], "createdAt": now})
    return {"access_token": create_access_token(str(user["_id"])), "user": user_response(user)}


@router.get("/me", response_model=UserResponse, summary="Get the authenticated user")
async def me(current_user: CurrentUser) -> dict:
    return user_response(current_user)
