"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Calendar, DollarSign, Plus, Bell, CheckCircle } from "lucide-react";
import { toast } from "sonner";
// Import addGoalNotification function inline since it's a simple utility
const addGoalNotification = (notification) => {
  const event = new CustomEvent('addGoalNotification', { detail: notification });
  window.dispatchEvent(event);
};
import { AddMoneyModal } from "./add-money-modal";

export function SavingsGoal({ userAccount, userAccounts = [] }) {
  const [goals, setGoals] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: "",
    targetAmount: "",
    frequency: "monthly"
  });

  // Monthly surplus allocation
  useEffect(() => {
    const checkMonthlyAllocation = () => {
      const now = new Date();
      const isEndOfMonth = now.getDate() >= 28; // Check last few days of month
      const lastAllocation = localStorage.getItem('lastMonthlyAllocation');
      const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
      
      if (isEndOfMonth && lastAllocation !== currentMonth && userAccount?.balance) {
        // Calculate surplus (assuming 70% of balance is available for goals)
        const monthlyExpenses = userAccount.balance * 0.3; // Estimated expenses
        const surplus = userAccount.balance - monthlyExpenses;
        
        if (surplus > 1000 && goals.length > 0) { // Only if significant surplus
          const activeGoals = goals.filter(g => g.isActive && (g.savedAmount / g.targetAmount) < 1);
          
          if (activeGoals.length > 0) {
            // Allocate surplus to the goal with highest priority (lowest completion %)
            const priorityGoal = activeGoals.reduce((prev, current) => 
              (prev.savedAmount / prev.targetAmount) < (current.savedAmount / current.targetAmount) ? prev : current
            );
            
            const allocationAmount = Math.min(surplus * 0.5, priorityGoal.targetAmount - priorityGoal.savedAmount);
            
            // Update goal with allocated amount
            setGoals(prev => prev.map(goal => 
              goal.id === priorityGoal.id 
                ? { ...goal, savedAmount: goal.savedAmount + allocationAmount }
                : goal
            ));
            
            // Add notification
            addGoalNotification({
              type: 'surplus_allocated',
              title: 'Monthly Surplus Allocated',
              message: `${formatCurrency(allocationAmount)} from your monthly surplus has been allocated to "${priorityGoal.title}"`
            });
            
            toast.success(`${formatCurrency(allocationAmount)} allocated to "${priorityGoal.title}" from monthly surplus!`);
            localStorage.setItem('lastMonthlyAllocation', currentMonth);
          }
        }
      }
    };

    const interval = setInterval(checkMonthlyAllocation, 24 * 60 * 60 * 1000); // Check daily
    checkMonthlyAllocation(); // Check immediately
    
    return () => clearInterval(interval);
  }, [goals, userAccount]);

  const handleMoneyAdded = (updatedGoal, updatedAccount, transaction) => {
    // Update the goal in state
    setGoals(prev => prev.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    ));

    // In a real app, you would also update the account balance via API
    // For now, we'll just show success feedback
    console.log('Transaction recorded:', transaction);
    console.log('Account updated:', updatedAccount);
  };

  // Load goals and sync with account balance
  useEffect(() => {
    const loadGoals = () => {
      // Get current account balance for calculations
      const accountBalance = userAccount?.balance || 0;
      
      const sampleGoals = [
        {
          id: "goal_001",
          title: "Travel to Banaras",
          targetAmount: 25000,
          savedAmount: Math.min(accountBalance * 0.34, 25000), // 34% of goal or account balance
          frequency: "monthly",
          targetDate: "2024-12-31",
          createdAt: "2024-08-01",
          isActive: true,
          accountId: userAccount?.id
        },
        {
          id: "goal_002", 
          title: "New Laptop",
          targetAmount: 80000,
          savedAmount: Math.min(accountBalance * 0.56, 80000), // 56% of goal or account balance
          frequency: "weekly",
          targetDate: "2024-11-15",
          createdAt: "2024-07-15",
          isActive: true,
          accountId: userAccount?.id
        }
      ];
      
      // Check for completed goals and trigger notifications
      sampleGoals.forEach(goal => {
        const progress = (goal.savedAmount / goal.targetAmount) * 100;
        if (progress >= 100 && goal.isActive) {
          triggerGoalCompletionNotification(goal);
        }
      });
      
      setGoals(sampleGoals);
    };

    if (userAccount) {
      loadGoals();
    }
  }, [userAccount]);

  const triggerGoalCompletionNotification = (goal) => {
    // Generate contextual completion message based on goal type
    const getCompletionMessage = (goalTitle) => {
      const title = goalTitle.toLowerCase();
      
      if (title.includes('travel') || title.includes('trip') || title.includes('vacation')) {
        return `🎉 Goal Complete! You can now book your ${goalTitle}! Consider booking flights and hotels now.`;
      } else if (title.includes('laptop') || title.includes('computer') || title.includes('phone')) {
        return `🎉 Goal Complete! You can now purchase your ${goalTitle}! Check online stores for the best deals.`;
      } else if (title.includes('car') || title.includes('bike') || title.includes('vehicle')) {
        return `🎉 Goal Complete! You can now buy your ${goalTitle}! Visit dealerships or check online listings.`;
      } else if (title.includes('house') || title.includes('home') || title.includes('apartment')) {
        return `🎉 Goal Complete! You can now proceed with your ${goalTitle} purchase! Contact real estate agents.`;
      } else if (title.includes('wedding') || title.includes('marriage')) {
        return `🎉 Goal Complete! You can now plan your ${goalTitle}! Start booking venues and services.`;
      } else if (title.includes('education') || title.includes('course') || title.includes('study')) {
        return `🎉 Goal Complete! You can now enroll in your ${goalTitle}! Apply to institutions or courses.`;
      } else {
        return `🎉 Congratulations! Your "${goalTitle}" goal is complete! You can now proceed with your planned purchase.`;
      }
    };

    const message = getCompletionMessage(goal.title);
    toast.success(message, { duration: 8000 });
    
    // Add to notification center
    addGoalNotification({
      type: 'goal_completed',
      title: `Goal Achieved: ${goal.title}`,
      message: `You've successfully saved ${formatCurrency(goal.targetAmount)} for your ${goal.title}! Time to make your purchase.`
    });

    // Delete the completed goal after a short delay
    setTimeout(() => {
      setGoals(prev => prev.filter(g => g.id !== goal.id));
      toast.info(`Goal "${goal.title}" has been archived after completion`, { duration: 4000 });
      
      // Add deletion notification
      addGoalNotification({
        type: 'goal_deleted',
        title: `Goal Archived: ${goal.title}`,
        message: `Your completed goal "${goal.title}" has been moved to your achievement records.`
      });
    }, 3000);
    
    // Show follow-up tip
    setTimeout(() => {
      toast.info(`💡 Tip: Consider setting a new savings goal to continue building your financial future!`, { duration: 6000 });
    }, 5000);
  };

  const handleCreateGoal = async () => {
    if (!newGoal.title.trim() || !newGoal.targetAmount) {
      toast.error("Please fill in all fields");
      return;
    }

    const accountBalance = userAccount?.balance || 0;
    const goal = {
      id: `goal_${Date.now()}`,
      title: newGoal.title,
      targetAmount: parseFloat(newGoal.targetAmount),
      savedAmount: 0, // Start with 0, will be calculated based on account balance
      frequency: newGoal.frequency,
      targetDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months from now
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true,
      accountId: userAccount?.id
    };

    setGoals(prev => [...prev, goal]);
    setNewGoal({ title: "", targetAmount: "", frequency: "monthly" });
    setShowCreateForm(false);
    
    // Schedule notification based on frequency
    scheduleNotification(goal);
    toast.success(`Goal "${goal.title}" created with ${goal.frequency} reminders!`);
  };

  const scheduleNotification = (goal) => {
    // In a real app, this would integrate with your notification system
    console.log(`Scheduling ${goal.frequency} notifications for goal: ${goal.title}`);
    
    // Simulate notification scheduling
    const notificationMessage = goal.frequency === "weekly" 
      ? `Weekly reminder: Save for your ${goal.title} goal!`
      : `Monthly reminder: Save for your ${goal.title} goal!`;
    
    toast.info(`${goal.frequency.charAt(0).toUpperCase() + goal.frequency.slice(1)} reminders set for "${goal.title}"`);
  };

  const calculateProgress = (savedAmount, targetAmount) => {
    return Math.min((savedAmount / targetAmount) * 100, 100);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          Savings Goals
        </CardTitle>
        <CardDescription>
          Set and track your financial goals with automated reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New Goal Button */}
        {!showCreateForm && (
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Goal
          </Button>
        )}

        {/* Create Goal Form */}
        {showCreateForm && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-lg">Create New Savings Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="goalTitle">Goal Title</Label>
                <Input
                  id="goalTitle"
                  placeholder="e.g., Travel to Banaras, New Laptop"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="targetAmount">Target Amount (₹)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="25000"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="frequency">Reminder Frequency</Label>
                <Select value={newGoal.frequency} onValueChange={(value) => setNewGoal(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly Reminders</SelectItem>
                    <SelectItem value="monthly">Monthly Reminders</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateGoal} className="flex-1">
                  <Target className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Goals */}
        {goals.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Active Goals ({goals.length})
            </h3>
            
            {goals.map((goal) => {
              const progress = calculateProgress(goal.savedAmount, goal.targetAmount);
              const remaining = goal.targetAmount - goal.savedAmount;
              
              return (
                <Card key={goal.id} className="border-green-100">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Goal Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg">{goal.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Target: {formatCurrency(goal.targetAmount)} by {new Date(goal.targetDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Bell className="h-3 w-3" />
                            {goal.frequency}
                          </Badge>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {Math.round(progress)}%
                          </Badge>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Saved: {formatCurrency(goal.savedAmount)}</span>
                          <span>Remaining: {formatCurrency(remaining)}</span>
                        </div>
                        <Progress 
                          value={progress} 
                          className="h-3"
                        />
                      </div>

                      {/* Goal Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-green-600">
                            {Math.round(progress)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Complete</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(goal.savedAmount)}
                          </p>
                          <p className="text-xs text-muted-foreground">Saved</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-orange-600">
                            {formatCurrency(remaining)}
                          </p>
                          <p className="text-xs text-muted-foreground">To Go</p>
                        </div>
                      </div>

                      {/* Action Button */}
                      {progress >= 100 ? (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => triggerGoalCompletionNotification(goal)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Goal Achieved! 🎉
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            setSelectedGoal(goal);
                            setShowAddMoneyModal(true);
                          }}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Add Money to Goal
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && !showCreateForm && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No savings goals yet. Create your first goal to get started!</p>
          </div>
        )}

        {/* Add Money Modal */}
        <AddMoneyModal
          isOpen={showAddMoneyModal}
          onClose={() => {
            setShowAddMoneyModal(false);
            setSelectedGoal(null);
          }}
          goal={selectedGoal}
          userAccounts={userAccounts}
          onMoneyAdded={handleMoneyAdded}
        />
      </CardContent>
    </Card>
  );
}
