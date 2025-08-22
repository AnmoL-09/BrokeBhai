import { db, refreshConnection } from './prisma';

// Retry wrapper for database operations to handle prepared statement errors
export async function withRetry(operation, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Check if it's a prepared statement error
      const isPreparedStatementError = 
        error.message?.includes('prepared statement') ||
        error.code === '42P05' || // prepared statement already exists
        error.code === '26000';   // prepared statement does not exist
      
      if (isPreparedStatementError && attempt < maxRetries) {
        console.log(`Prepared statement error on attempt ${attempt}, retrying...`);
        
        // Refresh connection and wait before retry
        await refreshConnection();
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
        continue;
      }
      
      // If it's not a prepared statement error or we've exhausted retries, throw
      throw error;
    }
  }
  
  throw lastError;
}

// Wrapper functions for common database operations
export const safeQuery = {
  findMany: (model, args) => withRetry(() => db[model].findMany(args)),
  findFirst: (model, args) => withRetry(() => db[model].findFirst(args)),
  findUnique: (model, args) => withRetry(() => db[model].findUnique(args)),
  create: (model, args) => withRetry(() => db[model].create(args)),
  update: (model, args) => withRetry(() => db[model].update(args)),
  upsert: (model, args) => withRetry(() => db[model].upsert(args)),
  delete: (model, args) => withRetry(() => db[model].delete(args)),
  aggregate: (model, args) => withRetry(() => db[model].aggregate(args)),
  count: (model, args) => withRetry(() => db[model].count(args)),
};
