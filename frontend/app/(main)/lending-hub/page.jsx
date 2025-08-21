"use client";
import { useEffect, useMemo, useState } from "react";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

async function api(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const baseHeaders = options.headers || {};
  const headers = { ...baseHeaders };
  if (method !== "GET" && method !== "HEAD" && options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${BACKEND_URL}${path}`, { ...options, headers, cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function LendingHubPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const identifier = useMemo(() => user?.id || user?.primaryEmailAddress?.emailAddress || "", [user]);

  const [summary, setSummary] = useState(null);
  const [loans, setLoans] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [balance, setBalance] = useState(null);
  const [days, setDays] = useState(30);

  // Loan form state
  const [counterparty, setCounterparty] = useState("");
  const [amount, setAmount] = useState(500);
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function resolveUserId(idOrEmail) {
    const u = await api(`/api/users/${encodeURIComponent(idOrEmail)}`);
    return u?.id;
  }

  async function refreshAll() {
    if (!identifier) return;
    try {
      setError("");
      const [s, l, n, b] = await Promise.all([
        api(`/api/savings_summary/${encodeURIComponent(identifier)}?days=${days}`),
        api(`/api/loans/user/${encodeURIComponent(identifier)}`),
        api(`/api/notifications/${encodeURIComponent(identifier)}`),
        api(`/api/accounts/balance/${encodeURIComponent(identifier)}`),
      ]);
      setSummary(s);
      setLoans(l);
      setNotifications(n);
      setBalance(b);
    } catch (e) {
      setError(e.message || "Failed to load data");
    }
  }

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, identifier, days]);

  async function onCreateLoan() {
    if (!counterparty || !amount || !dueDate) {
      setError("Please fill counterparty, amount and due date");
      return;
    }
    setCreating(true);
    try {
      setError("");
      // Resolve both users (current user as borrower by default)
      const borrowerId = await resolveUserId(identifier);
      const lenderId = await resolveUserId(counterparty);
      if (!borrowerId || !lenderId) throw new Error("Could not resolve user IDs");
      const payload = { lender_id: lenderId, borrower_id: borrowerId, amount: Number(amount), due_date: new Date(dueDate).toISOString() };
      await api(`/api/create_loan`, { method: "POST", body: JSON.stringify(payload) });
      setCounterparty("");
      setAmount(500);
      setDueDate("");
      await refreshAll();
    } catch (e) {
      setError(e.message || "Failed to create loan");
    } finally {
      setCreating(false);
    }
  }

  async function onRepayLoan(loanId) {
    try {
      await api(`/api/repay_loan`, { method: "POST", body: JSON.stringify({ loan_id: loanId }) });
      await refreshAll();
    } catch (e) {
      setError(e.message || "Failed to repay");
    }
  }

  async function onCheckOverdue() {
    try {
      await api(`/api/loans/check_overdue`, { method: "POST" });
      await refreshAll();
    } catch (e) {
      setError(e.message || "Failed to check overdue");
    }
  }

  return (
    <div className="space-y-6">
      <SignedOut>
        <Card>
          <CardHeader>
            <CardTitle>Smart Lending Hub</CardTitle>
            <CardDescription>Sign in to view your loans and insights.</CardDescription>
          </CardHeader>
          <CardContent>
            <SignInButton>
              <Button>Sign In</Button>
            </SignInButton>
          </CardContent>
        </Card>
      </SignedOut>

      <SignedIn>
        <Card>
          <CardHeader>
            <CardTitle>Smart Lending Hub</CardTitle>
            <CardDescription>All your lending actions and insights in one place.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Stat label="Total Balance" value={balance?.total_balance != null ? `$${balance.total_balance.toFixed(2)}` : "—"} />
            <Stat label="Avg Daily Spend" value={summary ? `$${Number(summary.average_daily_expense || 0).toFixed(2)}` : "—"} />
            <Stat label="Max Daily" value={summary ? `$${Number(summary.max_daily_expense || 0).toFixed(2)}` : "—"} />
            <Stat label="Min Daily" value={summary ? `$${Number(summary.min_daily_expense || 0).toFixed(2)}` : "—"} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk & Savings Insights</CardTitle>
              <CardDescription>
                Window
                <input type="number" min={7} max={365} value={days} onChange={(e) => setDays(Number(e.target.value || 30))} className="ml-2 border rounded px-2 py-1 w-24" /> days
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary ? (
                <div className="space-y-2 text-sm">
                  <div>Total Spent: ${Number(summary.total_spent || 0).toFixed(2)}</div>
                  <div>Average Daily: ${Number(summary.average_daily_expense || 0).toFixed(2)}</div>
                  <div>Max Daily: ${Number(summary.max_daily_expense || 0).toFixed(2)}</div>
                  <div>Min Daily: ${Number(summary.min_daily_expense || 0).toFixed(2)}</div>
                  <div className="mt-3">
                    <div className="font-medium">AI Suggestions</div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{summary.ai_suggestions || "No suggestions"}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No data yet.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create Loan</CardTitle>
              <CardDescription>Counterparty email or Clerk user ID, amount and due date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <input className="border rounded px-3 py-2 w-full" placeholder="Counterparty (email or clerkUserId)" value={counterparty} onChange={(e) => setCounterparty(e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" className="border rounded px-3 py-2 w-full" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <input type="date" className="border rounded px-3 py-2 w-full" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={onCreateLoan} disabled={creating}>Create Loan</Button>
                <Button variant="outline" onClick={onCheckOverdue}>Check Overdue</Button>
                <Button variant="ghost" onClick={refreshAll}>Refresh</Button>
              </div>
              {error && <div className="text-sm text-destructive">{error}</div>}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Loans</CardTitle>
              <CardDescription>As borrower or lender.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(loans || []).length === 0 && <div className="text-sm text-muted-foreground">No loans yet.</div>}
              {(loans || []).map((loan) => (
                <div key={loan.id} className="flex items-center justify-between border rounded p-3">
                  <div className="text-sm">
                    <div className="font-medium">Amount: ${Number(loan.amount || 0).toFixed(2)} | Status: {loan.status}</div>
                    <div>Due: {loan.due_date}</div>
                    <div>Lender: {loan.lender_id} | Borrower: {loan.borrower_id}</div>
                  </div>
                  {loan.status !== "repaid" && (
                    <Button size="sm" onClick={() => onRepayLoan(loan.id)}>Mark Repaid</Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Reminders and updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(notifications || []).length === 0 && <div className="text-sm text-muted-foreground">No notifications.</div>}
              {(notifications || []).map((n) => (
                <div key={n.id} className="border rounded p-3 text-sm">
                  <div className="font-medium">{n.type}</div>
                  <div>{n.message}</div>
                  <div className="text-xs text-muted-foreground">{n.created_at}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </SignedIn>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-3 rounded border bg-card">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}


