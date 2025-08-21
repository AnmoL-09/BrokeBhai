# app/routers/transactions.py
from fastapi import APIRouter, HTTPException, Query
from app.models import TransactionModel, TransactionCreate
from typing import List
from app.supabase_client import get_supabase
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=TransactionModel, status_code=201)
async def create_transaction(transaction: TransactionCreate, user_id: str = Query(..., description="User ID (clerkUserId or email)")):
    """Create a new transaction for a user in Supabase."""
    sb = get_supabase()
    if sb is None:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")

    try:
        # Resolve user id (UUID) by clerkUserId/email
        user_res = sb.table("users").select("id").or_(f"clerkUserId.eq.{user_id},email.eq.{user_id}").limit(1).execute()
        if not user_res.data:
            raise HTTPException(status_code=404, detail="User not found")
        resolved_user_id = user_res.data[0]["id"]

        # For simplicity, associate with the user's default account if exists, else create a placeholder account
        acct_res = sb.table("accounts").select("id").eq("userId", resolved_user_id).eq("isDefault", True).limit(1).execute()
        account_id = None
        if acct_res.data:
            account_id = acct_res.data[0]["id"]
        else:
            # Fallback: pick any account
            any_acct = sb.table("accounts").select("id").eq("userId", resolved_user_id).limit(1).execute()
            if any_acct.data:
                account_id = any_acct.data[0]["id"]
            else:
                # Create a default account if none exists
                acct_insert = sb.table("accounts").insert({
                    "name": "Default Account",
                    "type": "CURRENT",
                    "userId": resolved_user_id,
                    "isDefault": True,
                }).select("id").limit(1).execute()
                if acct_insert.data:
                    account_id = acct_insert.data[0]["id"]

        # Map fields to Prisma schema in frontend
        insert_payload = {
            "type": "INCOME" if transaction.transaction_type == "income" else "EXPENSE",
            "amount": str(transaction.amount),
            "description": transaction.description,
            "date": datetime.utcnow().isoformat(),
            "category": transaction.category,
            "userId": resolved_user_id,
        }
        if account_id:
            insert_payload["accountId"] = account_id

        res = sb.table("transactions").insert(insert_payload).select("*").limit(1).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create transaction")
        created = res.data[0]

        # Map Supabase row to TransactionModel fields (approximate)
        return TransactionModel(
            id=created.get("id"),
            user_id=created.get("userId"),
            amount=float(created.get("amount")),
            category=created.get("category"),
            description=created.get("description") or "",
            date=created.get("date"),
            transaction_type="income" if created.get("type") == "INCOME" else "expense",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating transaction: {str(e)}")

@router.get("/user/{user_id}", response_model=List[TransactionModel])
async def get_user_transactions(user_id: str):
    """Get transactions for a specific user from Supabase."""
    sb = get_supabase()
    if sb is None:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")

    try:
        # Resolve UUID
        user_res = sb.table("users").select("id").or_(f"clerkUserId.eq.{user_id},email.eq.{user_id}").limit(1).execute()
        if not user_res.data:
            raise HTTPException(status_code=404, detail="User not found")
        resolved_user_id = user_res.data[0]["id"]

        res = sb.table("transactions").select("*").eq("userId", resolved_user_id).order("date", desc=True).limit(100).execute()
        rows = res.data or []
        return [
            TransactionModel(
                id=row.get("id"),
                user_id=row.get("userId"),
                amount=float(row.get("amount")),
                category=row.get("category"),
                description=row.get("description") or "",
                date=row.get("date"),
                transaction_type="income" if row.get("type") == "INCOME" else "expense",
            )
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching transactions: {str(e)}")