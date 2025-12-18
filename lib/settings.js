import { getDatabase } from './mongodb';

/**
 * Get user alert settings
 */
export async function getUserSettings(userId) {
  const db = await getDatabase();
  const settingsCollection = db.collection('user_settings');
  
  // Convert userId to string for consistent comparison
  const userIdStr = typeof userId === 'string' ? userId : userId.toString();
  
  const settings = await settingsCollection.findOne({ userId: userIdStr });
  
  if (!settings) {
    // Initialize default settings if they don't exist
    const defaultSettings = {
      userId: userIdStr,
      alertAccessEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await settingsCollection.insertOne(defaultSettings);
    return defaultSettings;
  }
  
  return settings;
}

/**
 * Update user alert settings
 */
export async function updateUserSettings(userId, updates) {
  const db = await getDatabase();
  const settingsCollection = db.collection('user_settings');
  
  // Convert userId to string for consistent comparison
  const userIdStr = typeof userId === 'string' ? userId : userId.toString();
  
  // Only allow alertAccessEnabled to be updated
  const allowedUpdates = {};
  if (updates.alertAccessEnabled !== undefined) {
    allowedUpdates.alertAccessEnabled = updates.alertAccessEnabled;
  }
  
  const updateData = {
    ...allowedUpdates,
    updatedAt: new Date()
  };
  
  const result = await settingsCollection.findOneAndUpdate(
    { userId: userIdStr },
    { 
      $set: updateData,
      $setOnInsert: {
        userId: userIdStr,
        createdAt: new Date()
      }
    },
    { upsert: true, returnDocument: 'after' }
  );
  
  return result.value;
}



