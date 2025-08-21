# app/routers/loans.py
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
from datetime import datetime
from app.models import LoanModel, LoanCreate, LoanRepayRequest, NotificationModel
from app.scheduler import check_overdue_loans
from app.supabase_client import get_supabase

router = APIRouter()


async def create_notification(user_id: str, loan_id: str, type_: str, message: str) -> None:
	sb = get_supabase()
	if sb is None:
		return
	sb.table("notifications").insert({
		"user_id": user_id,
		"loan_id": loan_id,
		"type": type_,
		"message": message,
		"created_at": datetime.utcnow().isoformat(),
		"read": False,
	}).execute()


@router.post("/create_loan", response_model=LoanModel, status_code=201)
async def create_loan(payload: LoanCreate, background_tasks: BackgroundTasks):
	sb = get_supabase()
	if sb is None:
		raise HTTPException(status_code=500, detail="Supabase client not initialized")
	try:
		loan_doc = payload.model_dump()
		loan_doc["status"] = "pending"
		loan_doc["created_at"] = datetime.utcnow().isoformat()
		res = sb.table("loans").insert(loan_doc).select("*").limit(1).execute()
		if not res.data:
			raise HTTPException(status_code=500, detail="Failed to create loan")
		created = res.data[0]

		# Notify borrower and lender
		background_tasks.add_task(
			create_notification,
			user_id=payload.borrower_id,
			loan_id=created["id"],
			type_="loan_created",
			message=f"You received a loan of {payload.amount} due on {payload.due_date.isoformat()}"
		)
		background_tasks.add_task(
			create_notification,
			user_id=payload.lender_id,
			loan_id=created["id"],
			type_="loan_created",
			message=f"You lent {payload.amount} to {payload.borrower_id} due on {payload.due_date.isoformat()}"
		)
		return LoanModel(**created)
	except HTTPException:
		raise
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Error creating loan: {str(e)}")


@router.post("/repay_loan", response_model=LoanModel)
async def repay_loan(payload: LoanRepayRequest, background_tasks: BackgroundTasks):
	sb = get_supabase()
	if sb is None:
		raise HTTPException(status_code=500, detail="Supabase client not initialized")
	try:
		loan_res = sb.table("loans").select("*").eq("id", payload.loan_id).limit(1).execute()
		if not loan_res.data:
			raise HTTPException(status_code=404, detail="Loan not found")
		loan = loan_res.data[0]
		if loan.get("status") == "repaid":
			raise HTTPException(status_code=400, detail="Loan already repaid")

		update_res = sb.table("loans").update({"status": "repaid", "repaid_at": datetime.utcnow().isoformat()}).eq("id", payload.loan_id).select("*").limit(1).execute()
		updated = update_res.data[0]

		# Notify lender that borrower repaid
		background_tasks.add_task(
			create_notification,
			user_id=updated["lender_id"],
			loan_id=updated["id"],
			type_="loan_repaid",
			message=f"Loan from {updated['lender_id']} to {updated['borrower_id']} has been repaid"
		)
		return LoanModel(**updated)
	except HTTPException:
		raise
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Error repaying loan: {str(e)}")


@router.get("/loans/user/{user_id}", response_model=List[LoanModel])
async def list_user_loans(user_id: str):
	sb = get_supabase()
	if sb is None:
		raise HTTPException(status_code=500, detail="Supabase client not initialized")
	# Resolve UUID
	user_res = sb.table("users").select("id").or_(f"clerkUserId.eq.{user_id},email.eq.{user_id}").limit(1).execute()
	if not user_res.data:
		raise HTTPException(status_code=404, detail="User not found")
	resolved_user_id = user_res.data[0]["id"]
	loans = (
		sb.table("loans")
		.select("*")
		.or_(f"lender_id.eq.{resolved_user_id},borrower_id.eq.{resolved_user_id}")
		.limit(200)
		.execute()
	)
	return [LoanModel(**doc) for doc in (loans.data or [])]


@router.get("/notifications/{user_id}", response_model=List[NotificationModel])
async def get_notifications(user_id: str):
	sb = get_supabase()
	if sb is None:
		raise HTTPException(status_code=500, detail="Supabase client not initialized")
	# Resolve UUID
	user_res = sb.table("users").select("id").or_(f"clerkUserId.eq.{user_id},email.eq.{user_id}").limit(1).execute()
	if not user_res.data:
		raise HTTPException(status_code=404, detail="User not found")
	resolved_user_id = user_res.data[0]["id"]
	notifs = sb.table("notifications").select("*").eq("user_id", resolved_user_id).order("created_at", desc=True).limit(200).execute()
	return [NotificationModel(**doc) for doc in (notifs.data or [])]


@router.post("/loans/check_overdue")
async def trigger_check_overdue():
	await check_overdue_loans()
	return {"status": "ok"}