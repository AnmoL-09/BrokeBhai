from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from app.supabase_client import get_supabase


router = APIRouter()


def _resolve_user_uuid(user_identifier: str):
	sb = get_supabase()
	if sb is None:
		raise HTTPException(status_code=500, detail="Supabase client not initialized")
	res = sb.table("users").select("id").or_(f"clerkUserId.eq.{user_identifier},email.eq.{user_identifier}").limit(1).execute()
	if not res.data:
		raise HTTPException(status_code=404, detail="User not found")
	return res.data[0]["id"]


@router.get("/accounts/user/{user_id}")
async def list_user_accounts(user_id: str) -> List[Dict[str, Any]]:
	"""List accounts for a user (id resolved by clerkUserId or email)."""
	sb = get_supabase()
	if sb is None:
		raise HTTPException(status_code=500, detail="Supabase client not initialized")

	resolved_user_id = _resolve_user_uuid(user_id)
	res = sb.table("accounts").select("id,name,type,balance,isDefault").eq("userId", resolved_user_id).order("createdAt", desc=True).execute()
	rows = res.data or []
	# Convert numeric balances to float
	for row in rows:
		if row.get("balance") is not None:
			try:
				row["balance"] = float(row["balance"])
			except Exception:
				pass
	return rows


@router.get("/accounts/default/{user_id}")
async def get_default_account(user_id: str) -> Optional[Dict[str, Any]]:
	sb = get_supabase()
	if sb is None:
		raise HTTPException(status_code=500, detail="Supabase client not initialized")

	resolved_user_id = _resolve_user_uuid(user_id)
	res = sb.table("accounts").select("id,name,type,balance,isDefault").eq("userId", resolved_user_id).eq("isDefault", True).limit(1).execute()
	if not res.data:
		return None
	row = res.data[0]
	if row.get("balance") is not None:
		try:
			row["balance"] = float(row["balance"])
		except Exception:
			pass
	return row


@router.get("/accounts/balance/{user_id}")
async def get_user_balance(user_id: str, total: bool = Query(True, description="Sum across all accounts if true; default account only if false")) -> Dict[str, Any]:
	"""Return user's balance. If total=true, sum all accounts; otherwise default account balance."""
	sb = get_supabase()
	if sb is None:
		raise HTTPException(status_code=500, detail="Supabase client not initialized")

	resolved_user_id = _resolve_user_uuid(user_id)
	if total:
		res = sb.table("accounts").select("balance").eq("userId", resolved_user_id).execute()
		balances = [row.get("balance") for row in (res.data or [])]
		total_balance = 0.0
		for b in balances:
			try:
				total_balance += float(b)
			except Exception:
				pass
		return {"userId": resolved_user_id, "total_balance": total_balance}
	else:
		res = sb.table("accounts").select("balance").eq("userId", resolved_user_id).eq("isDefault", True).limit(1).execute()
		if not res.data:
			return {"userId": resolved_user_id, "default_balance": 0.0}
		try:
			balance = float(res.data[0].get("balance", 0))
		except Exception:
			balance = 0.0
		return {"userId": resolved_user_id, "default_balance": balance}


