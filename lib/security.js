import { getDatabase } from './mongodb';

/**
 * Update last login timestamp
 */
export async function updateLastLogin(userId) {
  const db = await getDatabase();
  const securityCollection = db.collection('user_security');
  
  // Convert userId to string for consistent comparison
  const userIdStr = typeof userId === 'string' ? userId : userId.toString();
  
  await securityCollection.updateOne(
    { userId: userIdStr },
    { 
      $set: { lastLogin: new Date() },
      $setOnInsert: {
        userId: userIdStr,
        createdAt: new Date()
      }
    },
    { upsert: true }
  );
}

