"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

export async function addMoneyToGoal(accountId, amount, goalId, goalTitle) {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get the account and verify ownership
      const account = await tx.account.findFirst({
        where: {
          id: accountId,
          userId: userId,
        },
      });

      if (!account) {
        throw new Error("Account not found");
      }

      if (account.balance < amount) {
        throw new Error("Insufficient balance");
      }

      // Update account balance (deduct money)
      const updatedAccount = await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          accountId: accountId,
          amount: -amount, // Negative for debit
          type: "EXPENSE",
          category: "SAVINGS",
          description: `Savings for ${goalTitle}`,
          date: new Date(),
          userId: userId,
        },
      });

      return {
        updatedAccount,
        transaction,
      };
    });

    // Revalidate the dashboard to show updated balances
    revalidatePath("/dashboard");

    return {
      success: true,
      updatedBalance: result.updatedAccount.balance,
      transaction: result.transaction,
    };
  } catch (error) {
    console.error("Error adding money to goal:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function createSavingsGoal(goalData) {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // In a real implementation, you might want to store goals in the database
    // For now, we'll just return success since goals are stored in localStorage
    
    return {
      success: true,
      goal: {
        id: `goal_${Date.now()}`,
        ...goalData,
        userId,
        createdAt: new Date(),
      },
    };
  } catch (error) {
    console.error("Error creating savings goal:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
