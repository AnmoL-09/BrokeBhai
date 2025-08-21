# app/routers/users.py
from fastapi import APIRouter, HTTPException
from app.models import UserModel, UserCreate
from typing import List
from app.supabase_client import get_supabase

router = APIRouter()

@router.post("/", response_model=UserModel, status_code=201)
async def create_user(user: UserCreate):
    """Create a new user in Supabase (users table)."""
    sb = get_supabase()
    if sb is None:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")

    try:
        # Check if exists by clerkUserId or email
        exists = sb.table("users").select("*").or_(f"clerkUserId.eq.{user.clerk_user_id},email.eq.{user.email}").limit(1).execute()
        if exists.data:
            # Return the existing user
            data = exists.data[0]
            # Map to UserModel fields expected by frontend models
            return UserModel(
                id=data.get("id"),
                clerk_user_id=data.get("clerkUserId"),
                email=data.get("email"),
                name=data.get("name") or "",
            )

        insert_payload = {
            "clerkUserId": user.clerk_user_id,
            "email": user.email,
            "name": user.name,
        }
        result = sb.table("users").insert(insert_payload).select("*").limit(1).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create user in Supabase")
        data = result.data[0]
        return UserModel(
            id=data.get("id"),
            clerk_user_id=data.get("clerkUserId"),
            email=data.get("email"),
            name=data.get("name") or "",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@router.get("/{user_id}", response_model=UserModel)
async def get_user(user_id: str):
    """Get user by clerkUserId or email from Supabase."""
    sb = get_supabase()
    if sb is None:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")

    try:
        # Search by clerkUserId then email
        res = sb.table("users").select("*").or_(f"clerkUserId.eq.{user_id},email.eq.{user_id}").limit(1).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="User not found")
        data = res.data[0]
        return UserModel(
            id=data.get("id"),
            clerk_user_id=data.get("clerkUserId"),
            email=data.get("email"),
            name=data.get("name") or "",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}")

@router.get("/", response_model=List[UserModel])
async def get_all_users():
    """Get all users from Supabase (limited)."""
    sb = get_supabase()
    if sb is None:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")

    try:
        res = sb.table("users").select("id, clerkUserId, email, name").limit(100).execute()
        return [
            UserModel(
                id=u.get("id"),
                clerk_user_id=u.get("clerkUserId"),
                email=u.get("email"),
                name=u.get("name") or "",
            )
            for u in (res.data or [])
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")