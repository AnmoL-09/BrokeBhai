# app/scheduler.py
from datetime import datetime
from typing import Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.supabase_client import get_supabase

scheduler: Optional[AsyncIOScheduler] = None


async def check_overdue_loans() -> None:
	sb = get_supabase()
	if sb is None:
		return
	now = datetime.utcnow()
	# Find loans with due_date < now and status not repaid/overdue
	res = sb.table("loans").select("id, amount, due_date, status, borrower_id").lt("due_date", now.isoformat()).not_.in_("status", ["repaid", "overdue"]).execute()
	for loan in res.data or []:
		# Mark overdue
		sb.table("loans").update({"status": "overdue"}).eq("id", loan["id"]).execute()
		# Notify borrower
		sb.table("notifications").insert({
			"user_id": loan["borrower_id"],
			"loan_id": loan["id"],
			"type": "loan_overdue",
			"message": f"Loan of {loan['amount']} is overdue. Due date was {loan['due_date']}.",
			"created_at": now.isoformat(),
			"read": False,
		}).execute()


def start_scheduler() -> None:
	global scheduler
	scheduler = AsyncIOScheduler()
	# Run nightly at midnight UTC
	scheduler.add_job(check_overdue_loans, CronTrigger(hour=0, minute=0))
	scheduler.start()
	print("🕒 APScheduler started: nightly overdue loan checks enabled")


def shutdown_scheduler() -> None:
	global scheduler
	if scheduler:
		scheduler.shutdown(wait=False)
		print("🕒 APScheduler shutdown complete") 