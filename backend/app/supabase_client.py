import os
from typing import Optional

from dotenv import load_dotenv

try:
	from supabase import create_client, Client
except Exception:  # Allow import-time failures during install steps
	create_client = None  # type: ignore
	Client = object  # type: ignore


load_dotenv()


class SupabaseStore:
	client: Optional[Client] = None


sb = SupabaseStore()


def connect_to_supabase() -> None:
	"""Initialize the global Supabase client using env vars.

	Requires SUPABASE_URL and one of SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY.
	For server-side usage, the service role key is recommended.
	"""
	if create_client is None:
		print("⚠️ supabase client not available yet; run 'pip install supabase' to enable DB access.")
		return

	url = os.getenv("SUPABASE_URL")
	key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
	if not url or not key:
		print("⚠️ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/ANON_KEY are not set; database access disabled.")
		return

	try:
		sb.client = create_client(url, key)
		print("✅ Connected to Supabase successfully!")
	except Exception as exc:
		sb.client = None
		print(f"❌ Error connecting to Supabase: {exc}")


def close_supabase_connection() -> None:
	"""Placeholder for compatibility; supabase-py does not maintain persistent sockets."""
	if sb.client is not None:
		print("Disconnected from Supabase (no persistent connection to close)")


def get_supabase() -> Optional[Client]:
	return sb.client


