import { getDatabase } from './mongodb';

/**
 * Get user alert and location settings
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
      locationAccessEnabled: false,
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
 * Update user alert and location settings
 */
export async function updateUserSettings(userId, updates) {
  const db = await getDatabase();
  const settingsCollection = db.collection('user_settings');
  
  // Convert userId to string for consistent comparison
  const userIdStr = typeof userId === 'string' ? userId : userId.toString();
  
  const updateData = {
    ...updates,
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



