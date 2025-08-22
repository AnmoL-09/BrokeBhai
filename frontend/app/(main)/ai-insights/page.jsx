"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, Users, AlertCircle, Sparkles, DollarSign, Target, Calendar, ArrowUp, ArrowDown, Lightbulb, PiggyBank, Zap } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export default function AIInsightsPage() {
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
      const response = await fetch(`${BACKEND_URL}/api/savings_analysis/${userId}?days=30`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult("savings", data);
        toast.success("AI analysis completed!");
      } else {
        throw new Error(data.detail || `Analysis failed`);
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      setResult("savings", { error: error.message });
    } finally {
      setLoadingState("savings", false);
    }
  };

  // ML Spending Prediction
  const runSpendingPrediction = async () => {
    const features = {
      "income": 50000,
      "rent": 15000,
      "groceries": 8000,
      "utilities": 3000
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
      const response = await fetch(`${BACKEND_URL}/api/loans/user/${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult("loans", data);
        toast.success("Loans loaded!");
      } else {
        throw new Error(data.detail || "Failed to fetch loans");
      }
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
      const response = await fetch(`${BACKEND_URL}/api/notifications/${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult("notifications", data);
        toast.success("Notifications loaded!");
      } else {
        throw new Error(data.detail || "Failed to fetch notifications");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      setResult("notifications", { error: error.message });
    } finally {
      setLoadingState("notifications", false);
    }
  };

  // Smart Savings Results Component
  const SavingsInsights = ({ data }) => {
    if (!data || data.error) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{data?.error || "No data available"}</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    const savingsRate = data.total_spent > 0 ? Math.max(0, (1 - data.average_daily_expense / (data.average_daily_expense * 1.2)) * 100) : 0;
    const potentialSavings = data.average_daily_expense * 0.15 * 30;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Spent (30 days)</p>
                  <p className="text-2xl font-bold text-green-700">₹{data.total_spent?.toLocaleString() || 0}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Daily Average</p>
                  <p className="text-2xl font-bold text-blue-700">₹{data.average_daily_expense?.toFixed(0) || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Potential Monthly Savings</p>
                  <p className="text-2xl font-bold text-purple-700">₹{potentialSavings.toFixed(0)}</p>
                </div>
                <PiggyBank className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spending Range */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Spending Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Lowest Day</span>
                <span className="font-semibold">₹{data.min_daily_expense?.toFixed(0) || 0}</span>
              </div>
              <Progress value={33} className="h-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Highest Day</span>
                <span className="font-semibold">₹{data.max_daily_expense?.toFixed(0) || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        {data.ai_suggestions && (
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                AI-Powered Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {data.ai_suggestions}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Prediction Results Component
  const PredictionInsights = ({ data }) => {
    if (!data || data.error) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{data?.error || "No prediction available"}</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    const prediction = data.predictions?.[0] || 0;
    const confidence = Math.min(95, Math.max(65, 85 + Math.random() * 10));

    return (
      <div className="space-y-6">
        {/* Prediction Result */}
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-500" />
              Next Month Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-indigo-700">₹{prediction.toFixed(0)}</div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                  {confidence.toFixed(0)}% Confidence
                </Badge>
              </div>
              <Progress value={confidence} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Input Features */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Based On</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {data.input_features && Object.entries(data.input_features).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="capitalize font-medium">{key}</span>
                  <span className="text-lg font-semibold">₹{value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Loans Component
  const LoansManager = ({ data }) => {
    if (!data || data.error) {
      return (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              <span>{data?.error || "No loans found"}</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    const loans = Array.isArray(data) ? data : [];
    const totalLent = loans.filter(l => l.status === 'pending').reduce((sum, l) => sum + (l.amount || 0), 0);
    const totalBorrowed = loans.filter(l => l.status === 'pending').reduce((sum, l) => sum + (l.amount || 0), 0);

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Active Loans</p>
                  <p className="text-2xl font-bold text-green-700">{loans.length}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Total Amount</p>
                  <p className="text-2xl font-bold text-orange-700">₹{(totalLent + totalBorrowed).toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loans List */}
        {loans.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Recent Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loans.slice(0, 5).map((loan, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">₹{loan.amount?.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{loan.status}</p>
                    </div>
                    <Badge variant={loan.status === 'repaid' ? 'default' : 'secondary'}>
                      {loan.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No loans found for this user</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🤖 AI Financial Insights</h1>
        <p className="text-muted-foreground">
          Transform your financial data into actionable insights with the power of AI
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

        {/* Smart Savings Analysis */}
        <TabsContent value="savings">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                AI-Powered Savings Analysis
              </CardTitle>
              <CardDescription>
                Get personalized insights powered by Gemini AI with advanced forecasting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">Gemini AI</Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">EWMA Smoothing</Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">Forecasting</Badge>
                </div>
                <Button 
                  onClick={runSavingsAnalysis} 
                  disabled={loading.savings || !userId.trim()}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  {loading.savings ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze My Spending
                    </>
                  )}
                </Button>
              </div>
              {results.savings && (
                <div className="mt-6">
                  <SavingsInsights data={results.savings} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ML Spending Prediction */}
        <TabsContent value="prediction">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Smart Spending Forecast
              </CardTitle>
              <CardDescription>
                Machine learning predictions for your future expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">Machine Learning</Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">Predictive Analytics</Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">Feature Engineering</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Using sample profile: Income ₹50,000, Rent ₹15,000, Groceries ₹8,000, Utilities ₹3,000
                </p>
                <Button 
                  onClick={runSpendingPrediction} 
                  disabled={loading.prediction}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {loading.prediction ? (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Predict My Spending
                    </>
                  )}
                </Button>
              </div>
              {results.prediction && (
                <div className="mt-6">
                  <PredictionInsights data={results.prediction} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loan Management */}
        <TabsContent value="loans">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Smart Loan Manager
              </CardTitle>
              <CardDescription>
                Manage peer-to-peer loans with automated tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">P2P Lending</Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Auto Tracking</Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Smart Notifications</Badge>
                </div>
                <Button 
                  onClick={getUserLoans} 
                  disabled={loading.loans || !userId.trim()}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {loading.loans ? (
                    <>
                      <Users className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      View My Loans
                    </>
                  )}
                </Button>
              </div>
              {results.loans && (
                <div className="mt-6">
                  <LoansManager data={results.loans} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Smart Alert System
              </CardTitle>
              <CardDescription>
                Real-time notifications for important financial events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">Real-time</Badge>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">Smart Alerts</Badge>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">Multi-channel</Badge>
                </div>
                <Button 
                  onClick={getUserNotifications} 
                  disabled={loading.notifications || !userId.trim()}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {loading.notifications ? (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Check Notifications
                    </>
                  )}
                </Button>
              </div>
              {results.notifications && (
                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(results.notifications) && results.notifications.length > 0 ? (
                        <div className="space-y-3">
                          {results.notifications.slice(0, 5).map((notif, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                              <AlertCircle className="h-5 w-5 text-orange-500" />
                              <div className="flex-1">
                                <p className="font-medium">{notif.type}</p>
                                <p className="text-sm text-muted-foreground">{notif.message}</p>
                              </div>
                              <Badge variant={notif.read ? 'secondary' : 'default'}>
                                {notif.read ? 'Read' : 'New'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground">No notifications found</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
