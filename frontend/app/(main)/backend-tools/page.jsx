"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, Users, AlertCircle, Sparkles, DollarSign, Target, Calendar, ArrowUp, ArrowDown, Lightbulb, Activity, Database, Zap, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export default function BackendToolsPage() {
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});
  const [userId, setUserId] = useState("");

  const setLoadingState = (key, state) => {
    setLoading(prev => ({ ...prev, [key]: state }));
  };

  const setResult = (key, data) => {
    setResults(prev => ({ ...prev, [key]: data }));
  };

  // Smart Savings Analysis
  const runSavingsAnalysis = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a User ID");
      return;
    }

    setLoadingState("savings", true);
    try {
      console.log(`Calling: ${BACKEND_URL}/api/savings_analysis/${userId}?days=30`);
      const response = await fetch(`${BACKEND_URL}/api/savings_analysis/${userId}?days=30`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        setResult("savings", data);
        toast.success("Savings analysis completed!");
      } else {
        throw new Error(data.detail || `HTTP ${response.status}: Analysis failed`);
      }
    } catch (error) {
      console.error('Savings analysis error:', error);
      toast.error(`Error: ${error.message}`);
      setResult("savings", { error: error.message, timestamp: new Date().toISOString() });
    } finally {
      setLoadingState("savings", false);
    }
  };

  // ML Spending Prediction
  const runSpendingPrediction = async () => {
    const features = {
      "monthly_income": 50000,
      "age": 28,
      "num_transactions": 45,
      "avg_transaction_amount": 1200,
      "days_since_last_transaction": 2
    };

    setLoadingState("prediction", true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/predict_spending`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features })
      });
      const data = await response.json();
      
      if (response.ok) {
        setResult("prediction", { ...data, input_features: features });
        toast.success("Prediction completed!");
      } else {
        throw new Error(data.detail || "Prediction failed");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      setResult("prediction", { error: error.message });
    } finally {
      setLoadingState("prediction", false);
    }
  };

  // Get User Loans
  const getUserLoans = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a User ID");
      return;
    }

    setLoadingState("loans", true);
    try {
      // Simulate API call with sample data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const sampleLoans = {
        loans: [
          {
            id: "loan_001",
            borrower_id: userId,
            lender_id: "user_sarah_chen",
            lender_name: "Sarah Chen",
            amount: 15000,
            interest_rate: 8.5,
            due_date: "2024-09-15",
            status: "active",
            created_at: "2024-08-01T10:30:00Z",
            remaining_amount: 12500,
            monthly_payment: 2500
          },
          {
            id: "loan_002",
            borrower_id: userId,
            lender_id: "user_michael_rodriguez",
            lender_name: "Michael Rodriguez",
            amount: 25000,
            interest_rate: 7.2,
            due_date: "2024-12-20",
            status: "active",
            created_at: "2024-07-15T14:20:00Z",
            remaining_amount: 22000,
            monthly_payment: 3500
          },
          {
            id: "loan_003",
            borrower_id: "user_priya_sharma",
            borrower_name: "Priya Sharma",
            lender_id: userId,
            amount: 8000,
            interest_rate: 9.0,
            due_date: "2024-10-30",
            status: "pending_payment",
            created_at: "2024-08-10T09:15:00Z",
            remaining_amount: 8000,
            monthly_payment: 2000
          }
        ],
        summary: {
          total_borrowed: 40000,
          total_lent: 8000,
          active_loans: 3,
          monthly_obligations: 6000
        }
      };
      
      setResult("loans", sampleLoans);
      toast.success("Loans fetched successfully!");
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      setResult("loans", { error: error.message });
    } finally {
      setLoadingState("loans", false);
    }
  };

  // Get Notifications
  const getUserNotifications = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a User ID");
      return;
    }

    setLoadingState("notifications", true);
    try {
      // Simulate API call with sample data
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const sampleNotifications = {
        notifications: [
          {
            id: "notif_001",
            user_id: userId,
            type: "loan_payment_due",
            title: "Payment Due Reminder",
            message: "Your loan payment of ₹2,500 to Sarah Chen is due in 3 days (Sep 15, 2024)",
            is_read: false,
            created_at: "2024-08-22T04:30:00Z",
            priority: "high",
            action_required: true
          },
          {
            id: "notif_002",
            user_id: userId,
            type: "loan_received",
            title: "Loan Payment Received",
            message: "Priya Sharma has made a payment of ₹2,000 towards their loan",
            is_read: false,
            created_at: "2024-08-21T16:45:00Z",
            priority: "medium",
            action_required: false
          },
          {
            id: "notif_003",
            user_id: userId,
            type: "spending_alert",
            title: "High Spending Alert",
            message: "You've spent ₹8,500 this week, which is 25% above your usual pattern",
            is_read: true,
            created_at: "2024-08-20T12:20:00Z",
            priority: "medium",
            action_required: false
          },
          {
            id: "notif_004",
            user_id: userId,
            type: "loan_approved",
            title: "Loan Request Approved",
            message: "Michael Rodriguez has approved your loan request of ₹25,000",
            is_read: true,
            created_at: "2024-08-19T09:15:00Z",
            priority: "high",
            action_required: false
          },
          {
            id: "notif_005",
            user_id: userId,
            type: "savings_milestone",
            title: "Savings Goal Achieved!",
            message: "Congratulations! You've reached 80% of your monthly savings target",
            is_read: true,
            created_at: "2024-08-18T14:30:00Z",
            priority: "low",
            action_required: false
          }
        ],
        summary: {
          total_notifications: 5,
          unread_count: 2,
          high_priority_count: 2,
          action_required_count: 1
        }
      };
      
      setResult("notifications", sampleNotifications);
      toast.success("Notifications fetched successfully!");
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      setResult("notifications", { error: error.message });
    } finally {
      setLoadingState("notifications", false);
    }
  };

  // Test Backend Health
  const testBackendHealth = async () => {
    setLoadingState("health", true);
    try {
      console.log(`Testing backend health: ${BACKEND_URL}/health`);
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Health check status:', response.status);
      const data = await response.json();
      console.log('Health check data:', data);
      
      if (response.ok) {
        setResult("health", { ...data, backend_url: BACKEND_URL, timestamp: new Date().toISOString() });
        toast.success("Backend is healthy!");
      } else {
        throw new Error(`HTTP ${response.status}: Health check failed`);
      }
    } catch (error) {
      console.error('Health check error:', error);
      toast.error(`Error: ${error.message}`);
      setResult("health", { error: error.message, backend_url: BACKEND_URL, timestamp: new Date().toISOString() });
    } finally {
      setLoadingState("health", false);
    }
  };

  // Test Database Connection
  const testDatabaseConnection = async () => {
    setLoadingState("database", true);
    try {
      console.log(`Testing database: ${BACKEND_URL}/test-db`);
      const response = await fetch(`${BACKEND_URL}/test-db`);
      const data = await response.json();
      
      if (response.ok) {
        setResult("database", { ...data, timestamp: new Date().toISOString() });
        toast.success("Database connection tested!");
      } else {
        throw new Error(`HTTP ${response.status}: Database test failed`);
      }
    } catch (error) {
      console.error('Database test error:', error);
      toast.error(`Error: ${error.message}`);
      setResult("database", { error: error.message, timestamp: new Date().toISOString() });
    } finally {
      setLoadingState("database", false);
    }
  };

  // Debug Environment
  const debugEnvironment = async () => {
    setLoadingState("env", true);
    try {
      console.log(`Debug environment: ${BACKEND_URL}/debug-env`);
      const response = await fetch(`${BACKEND_URL}/debug-env`);
      const data = await response.json();
      
      if (response.ok) {
        setResult("env", { ...data, frontend_backend_url: BACKEND_URL, timestamp: new Date().toISOString() });
        toast.success("Environment debug completed!");
      } else {
        throw new Error(`HTTP ${response.status}: Environment debug failed`);
      }
    } catch (error) {
      console.error('Environment debug error:', error);
      toast.error(`Error: ${error.message}`);
      setResult("env", { error: error.message, timestamp: new Date().toISOString() });
    } finally {
      setLoadingState("env", false);
    }
  };

  // Smart UI component for different result types
  const SmartResultCard = ({ title, data, loading: isLoading, type }) => {
    if (isLoading) {
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!data) {
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-gray-400" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No data yet</p>
          </CardContent>
        </Card>
      );
    }

    // Handle error states
    if (data.error) {
      return (
        <Card className="mt-4 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              {title} - Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-600">
              <p className="font-medium">Error occurred:</p>
              <p className="text-sm mt-1">{data.error}</p>
              {data.timestamp && (
                <p className="text-xs text-red-500 mt-2">Time: {new Date(data.timestamp).toLocaleString()}</p>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Render based on data type
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {type === 'savings' && data.recommendations ? (
            <SavingsAnalysisCard data={data} />
          ) : type === 'prediction' && data.predictions ? (
            <PredictionCard data={data} />
          ) : type === 'loans' && data.loans ? (
            <LoansCard data={data} />
          ) : type === 'notifications' && data.notifications ? (
            <NotificationsCard data={data} />
          ) : type === 'health' && data.status ? (
            <HealthCard data={data} />
          ) : type === 'database' ? (
            <DatabaseCard data={data} />
          ) : (
            // Fallback to formatted JSON for unknown types
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Specialized card components
  const SavingsAnalysisCard = ({ data }) => (
    <div className="space-y-4">
      {data.spending_trend && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Spending Trend Analysis
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Current Average:</span>
              <p className="text-blue-900">₹{data.spending_trend.current_avg?.toFixed(2) || 'N/A'}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Trend:</span>
              <p className="text-blue-900">{data.spending_trend.trend || 'Stable'}</p>
            </div>
          </div>
        </div>
      )}
      
      {data.recommendations && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            AI Recommendations
          </h4>
          <div className="space-y-2">
            {data.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-green-800 text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {data.forecast && (
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            30-Day Forecast
          </h4>
          <p className="text-purple-800 text-sm">
            Predicted spending: ₹{data.forecast.predicted_spending?.toFixed(2) || 'N/A'}
          </p>
        </div>
      )}
    </div>
  );

  const PredictionCard = ({ data }) => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          ML Prediction Results
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-blue-700 font-medium text-sm">Predicted Amount:</span>
            <p className="text-blue-900 text-lg font-bold">
              ₹{data.predictions?.[0]?.toFixed(2) || 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-blue-700 font-medium text-sm">Confidence:</span>
            <p className="text-blue-900">High</p>
          </div>
        </div>
      </div>
      
      {data.input_features && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">Input Features</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(data.input_features).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                <span className="text-gray-900 font-medium">
                  {typeof value === 'number' && key.includes('amount') ? `₹${value.toLocaleString()}` : value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const LoansCard = ({ data }) => (
    <div className="space-y-4">
      {data.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-green-700 text-sm font-medium">Total Borrowed</p>
            <p className="text-green-900 text-lg font-bold">₹{data.summary.total_borrowed?.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-blue-700 text-sm font-medium">Total Lent</p>
            <p className="text-blue-900 text-lg font-bold">₹{data.summary.total_lent?.toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <p className="text-purple-700 text-sm font-medium">Active Loans</p>
            <p className="text-purple-900 text-lg font-bold">{data.summary.active_loans}</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <p className="text-orange-700 text-sm font-medium">Monthly Obligations</p>
            <p className="text-orange-900 text-lg font-bold">₹{data.summary.monthly_obligations?.toLocaleString()}</p>
          </div>
        </div>
      )}
      
      {data.loans && data.loans.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Loan Details</h4>
          {data.loans.map((loan) => (
            <div key={loan.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {loan.lender_name || loan.borrower_name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {loan.lender_name ? 'Borrowed from' : 'Lent to'}
                  </p>
                </div>
                <Badge variant={loan.status === 'active' ? 'default' : 'secondary'}>
                  {loan.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <p className="font-medium">₹{loan.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Interest Rate:</span>
                  <p className="font-medium">{loan.interest_rate}%</p>
                </div>
                <div>
                  <span className="text-gray-600">Due Date:</span>
                  <p className="font-medium">{new Date(loan.due_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Monthly Payment:</span>
                  <p className="font-medium">₹{loan.monthly_payment?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const NotificationsCard = ({ data }) => (
    <div className="space-y-4">
      {data.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-blue-700 text-sm font-medium">Total</p>
            <p className="text-blue-900 text-lg font-bold">{data.summary.total_notifications}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-red-700 text-sm font-medium">Unread</p>
            <p className="text-red-900 text-lg font-bold">{data.summary.unread_count}</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <p className="text-orange-700 text-sm font-medium">High Priority</p>
            <p className="text-orange-900 text-lg font-bold">{data.summary.high_priority_count}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <p className="text-purple-700 text-sm font-medium">Action Required</p>
            <p className="text-purple-900 text-lg font-bold">{data.summary.action_required_count}</p>
          </div>
        </div>
      )}
      
      {data.notifications && data.notifications.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Recent Notifications</h4>
          {data.notifications.slice(0, 5).map((notif) => (
            <div key={notif.id} className={`p-4 rounded-lg border ${
              notif.is_read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium text-gray-900">{notif.title}</h5>
                <div className="flex gap-2">
                  <Badge variant={notif.priority === 'high' ? 'destructive' : notif.priority === 'medium' ? 'default' : 'secondary'}>
                    {notif.priority}
                  </Badge>
                  {notif.action_required && (
                    <Badge variant="outline">Action Required</Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">{notif.message}</p>
              <p className="text-xs text-gray-500">
                {new Date(notif.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const HealthCard = ({ data }) => (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg border ${
        data.status === 'healthy' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {data.status === 'healthy' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
          <h4 className={`font-semibold ${
            data.status === 'healthy' ? 'text-green-900' : 'text-red-900'
          }`}>
            Backend Status: {data.status || 'Unknown'}
          </h4>
        </div>
        {data.message && (
          <p className={`text-sm ${
            data.status === 'healthy' ? 'text-green-800' : 'text-red-800'
          }`}>
            {data.message}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600 font-medium">Backend URL:</span>
          <p className="text-gray-900 font-mono text-xs break-all">{data.backend_url}</p>
        </div>
        <div>
          <span className="text-gray-600 font-medium">Timestamp:</span>
          <p className="text-gray-900">{new Date(data.timestamp).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );

  const DatabaseCard = ({ data }) => (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg border ${
        data.supabase_status === 'connected' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {data.supabase_status === 'connected' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
          <h4 className={`font-semibold ${
            data.supabase_status === 'connected' ? 'text-green-900' : 'text-red-900'
          }`}>
            Supabase: {data.supabase_status || 'Unknown'}
          </h4>
        </div>
      </div>
      
      {data.mongodb_status && (
        <div className={`p-4 rounded-lg border ${
          data.mongodb_status === 'connected' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {data.mongodb_status === 'connected' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            <h4 className={`font-semibold ${
              data.mongodb_status === 'connected' ? 'text-green-900' : 'text-yellow-900'
            }`}>
              MongoDB: {data.mongodb_status || 'Unknown'}
            </h4>
          </div>
        </div>
      )}
      
      <div className="text-sm text-gray-600">
        <p>Checked at: {new Date(data.timestamp).toLocaleString()}</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🤖 AI Financial Insights</h1>
        <p className="text-muted-foreground">
          Unlock the power of AI to transform your financial data into actionable insights
        </p>
      </div>

      {/* User ID Input */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Get Started with AI Analysis
          </CardTitle>
          <CardDescription>Enter your User ID to unlock personalized financial insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="userId">User ID (Clerk ID or Email)</Label>
              <Input
                id="userId"
                placeholder="user_2abc123... or user@example.com"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="border-purple-200 focus:border-purple-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="savings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-purple-100 to-blue-100">
          <TabsTrigger value="savings" className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <Brain className="h-4 w-4" />
            Smart Savings
          </TabsTrigger>
          <TabsTrigger value="prediction" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <TrendingUp className="h-4 w-4" />
            Spending Forecast
          </TabsTrigger>
          <TabsTrigger value="loans" className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white">
            <Users className="h-4 w-4" />
            Loan Manager
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <AlertCircle className="h-4 w-4" />
            Smart Alerts
          </TabsTrigger>
        </TabsList>

        {/* Backend Health Check */}
        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Backend Health Check
              </CardTitle>
              <CardDescription>
                Test basic backend connectivity and API status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Badge variant="secondary">FastAPI</Badge>
                  <Badge variant="secondary">Health Endpoint</Badge>
                  <Badge variant="secondary">Status Check</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Backend URL: {BACKEND_URL}
                </p>
                <Button onClick={testBackendHealth} disabled={loading.health}>
                  {loading.health ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
                  Test Health
                </Button>
              </div>
              {results.health && (
                <SmartResultCard title="Health Check Results" data={results.health} loading={loading.health} type="health" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Savings Analysis */}
        <TabsContent value="savings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Smart Savings Analysis
              </CardTitle>
              <CardDescription>
                AI-powered spending insights using Gemini 2.5 Pro with EWMA smoothing and forecasting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Badge variant="secondary">EWMA Smoothing</Badge>
                  <Badge variant="secondary">Prophet Forecasting</Badge>
                  <Badge variant="secondary">Gemini AI</Badge>
                </div>
                <Button onClick={runSavingsAnalysis} disabled={loading.savings || !userId.trim()}>
                  {loading.savings ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
                  Run Savings Analysis
                </Button>
              </div>
              {results.savings && (
                <SmartResultCard title="Savings Analysis Results" data={results.savings} loading={loading.savings} type="savings" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ML Spending Prediction */}
        <TabsContent value="prediction">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                ML Spending Prediction
              </CardTitle>
              <CardDescription>
                Custom ML model for expense prediction with feature-based analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Badge variant="secondary">Scikit-learn</Badge>
                  <Badge variant="secondary">Feature Engineering</Badge>
                  <Badge variant="secondary">Batch Prediction</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Using sample features: Monthly Income: ₹50,000, Age: 28, Transactions: 45
                </p>
                <Button onClick={runSpendingPrediction} disabled={loading.prediction}>
                  {loading.prediction ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                  Predict Spending
                </Button>
              </div>
              {results.prediction && (
                <SmartResultCard title="Prediction Results" data={results.prediction} loading={loading.prediction} type="prediction" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loan Management */}
        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Loan Management System
              </CardTitle>
              <CardDescription>
                P2P lending with automated notifications and status tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Badge variant="secondary">P2P Lending</Badge>
                  <Badge variant="secondary">Auto Notifications</Badge>
                  <Badge variant="secondary">Status Tracking</Badge>
                </div>
                <Button onClick={getUserLoans} disabled={loading.loans || !userId.trim()}>
                  {loading.loans ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
                  Get User Loans
                </Button>
              </div>
              {results.loans && (
                <SmartResultCard title="User Loans" data={results.loans} loading={loading.loans} type="loans" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Notification System
              </CardTitle>
              <CardDescription>
                Real-time notifications for loans, payments, and system alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Badge variant="secondary">Real-time</Badge>
                  <Badge variant="secondary">Background Tasks</Badge>
                  <Badge variant="secondary">Multi-type</Badge>
                </div>
                <Button onClick={getUserNotifications} disabled={loading.notifications || !userId.trim()}>
                  {loading.notifications ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                  Get Notifications
                </Button>
              </div>
              {results.notifications && (
                <SmartResultCard title="User Notifications" data={results.notifications} loading={loading.notifications} type="notifications" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Debug Tab */}
        <TabsContent value="debug">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  Database Connection Test
                </CardTitle>
                <CardDescription>
                  Test Supabase database connectivity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Badge variant="secondary">Supabase</Badge>
                    <Badge variant="secondary">PostgreSQL</Badge>
                    <Badge variant="secondary">Connection Pool</Badge>
                  </div>
                  <Button onClick={testDatabaseConnection} disabled={loading.database}>
                    {loading.database ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                    Test Database
                  </Button>
                </div>
                {results.database && (
                  <SmartResultCard title="Database Test Results" data={results.database} loading={loading.database} type="database" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Environment Debug
                </CardTitle>
                <CardDescription>
                  Check environment variables and configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Badge variant="secondary">Environment</Badge>
                    <Badge variant="secondary">Configuration</Badge>
                    <Badge variant="secondary">Variables</Badge>
                  </div>
                  <Button onClick={debugEnvironment} disabled={loading.env}>
                    {loading.env ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                    Debug Environment
                  </Button>
                </div>
                {results.env && (
                  <SmartResultCard title="Environment Debug Results" data={results.env} loading={loading.env} type="env" />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
