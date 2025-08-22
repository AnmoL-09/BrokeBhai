# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_to_mongo, close_mongo_connection, db
from app.ml_model import load_ml_model
from app.scheduler import start_scheduler, shutdown_scheduler
from app.supabase_client import connect_to_supabase, close_supabase_connection, get_supabase

@asynccontextmanager
async def lifespan(app: FastAPI):
	# Startup
	print("🚀 Starting up Financial Management API...")
	# Initialize Supabase (new primary datastore)
	connect_to_supabase()
	# Keep Mongo optional: do not fail if missing; legacy routes may still use it
	await connect_to_mongo()
	# Load ML model synchronously
	load_ml_model()
	# Start scheduler
	start_scheduler()
	yield
	# Shutdown
	print("🛑 Shutting down Financial Management API...")
	shutdown_scheduler()
	close_supabase_connection()
	await close_mongo_connection()

app = FastAPI(
	title="Financial Management API",
	description="Backend for financial management app",
	version="1.0.0",
	lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Include routers
from app.routers import users, transactions
from app.routers import predict as predict_router
from app.routers import loans as loans_router
from app.routers import savings as savings_router
from app.routers import accounts as accounts_router
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["transactions"])
app.include_router(predict_router.router, prefix="/api", tags=["predict"])
app.include_router(loans_router.router, prefix="/api", tags=["loans", "notifications"])
app.include_router(savings_router.router, prefix="/api", tags=["savings"])
app.include_router(accounts_router.router, prefix="/api", tags=["accounts"])

@app.get("/")
async def root():
	return {"message": "Financial Management API is running"}

@app.get("/health")
async def health_check():
	return {"status": "healthy"}

@app.get("/test-db")
async def test_database():
	"""Test endpoint to check Supabase connectivity"""
	sb = get_supabase()
	try:
		if sb is None:
			return {"status": "Supabase client not initialized"}
		# Simple select with limit 1 against users table
		res = sb.table("users").select("id").limit(1).execute()
		return {
			"status": "Supabase connected",
			"users_rows_seen": len(res.data or []),
		}
	except Exception as e:
		return {"status": "Supabase error", "error": str(e)}

@app.get("/debug-env")
async def debug_env():
	import os
	return {
		"MONGODB_URL_present": "MONGODB_URL" in os.environ,
		"SUPABASE_URL_present": "SUPABASE_URL" in os.environ,
		"SUPABASE_KEY_present": ("SUPABASE_SERVICE_ROLE_KEY" in os.environ) or ("SUPABASE_ANON_KEY" in os.environ),
	}