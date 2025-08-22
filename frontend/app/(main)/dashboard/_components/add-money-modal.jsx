"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, CreditCard, X } from "lucide-react";
import { toast } from "sonner";
import { addMoneyToGoal } from "@/actions/savings-goals";

export function AddMoneyModal({ isOpen, onClose, goal, userAccounts, onMoneyAdded }) {
  const [amount, setAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleAddMoney = async () => {
    if (!amount || !selectedAccountId) {
      toast.error("Please enter amount and select an account");
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const selectedAccount = userAccounts.find(acc => acc.id === selectedAccountId);
    if (!selectedAccount) {
      toast.error("Selected account not found");
      return;
    }

    if (selectedAccount.balance < amountNum) {
      toast.error(`Insufficient balance. Available: ${formatCurrency(selectedAccount.balance)}`);
      return;
    }

    const remainingGoalAmount = goal.targetAmount - goal.savedAmount;
    if (amountNum > remainingGoalAmount) {
      toast.error(`Amount exceeds goal requirement. Maximum: ${formatCurrency(remainingGoalAmount)}`);
      return;
    }

    setIsProcessing(true);

    try {
      // Call server action to actually debit the account
      const result = await addMoneyToGoal(
        selectedAccountId,
        amountNum,
        goal.id,
        goal.title
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      // Create updated account object with new balance
      const updatedAccount = {
        ...selectedAccount,
        balance: result.updatedBalance
      };

      // Update goal saved amount
      const updatedGoal = {
        ...goal,
        savedAmount: goal.savedAmount + amountNum
      };

      // Call parent component to update state
      onMoneyAdded(updatedGoal, updatedAccount, result.transaction);

      toast.success(`${formatCurrency(amountNum)} added to "${goal.title}" goal!`);
      
      // Add notification
      const addGoalNotification = (notification) => {
        const event = new CustomEvent('addGoalNotification', { detail: notification });
        window.dispatchEvent(event);
      };

      addGoalNotification({
        type: 'goal_contribution',
        title: `Money Added to Goal`,
        message: `${formatCurrency(amountNum)} has been added to your "${goal.title}" goal from ${selectedAccount.name}`
      });

      onClose();
      setAmount("");
      setSelectedAccountId("");

    } catch (error) {
      toast.error(`Failed to add money to goal: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Add Money to Goal
            </CardTitle>
            <CardDescription>
              Add money to "{goal?.title}" goal
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Goal Progress Info */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span>Current Progress:</span>
              <span className="font-semibold">
                {formatCurrency(goal?.savedAmount || 0)} / {formatCurrency(goal?.targetAmount || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Remaining:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency((goal?.targetAmount || 0) - (goal?.savedAmount || 0))}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Add (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max={(goal?.targetAmount || 0) - (goal?.savedAmount || 0)}
            />
          </div>

          {/* Account Selection */}
          <div className="space-y-2">
            <Label htmlFor="account">Select Account</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose account to debit from" />
              </SelectTrigger>
              <SelectContent>
                {userAccounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>{account.name}</span>
                      <span className="text-muted-foreground">
                        ({formatCurrency(account.balance)})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleAddMoney} 
              disabled={isProcessing || !amount || !selectedAccountId}
              className="flex-1"
            >
              {isProcessing ? "Processing..." : `Add ${amount ? formatCurrency(parseFloat(amount) || 0) : "Money"}`}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
