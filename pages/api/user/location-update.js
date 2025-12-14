import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getDatabase } from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = session.user.id;

  try {
    const { latitude, longitude, accuracy, timestamp } = req.body;

    // Validate required fields
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Validate coordinates
    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      return res.status(400).json({ message: 'Invalid latitude' });
    }

    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'Invalid longitude' });
    }

    // Check if user has alert access enabled
    const db = await getDatabase();
    const settingsCollection = db.collection('user_settings');
    const userIdStr = typeof userId === 'string' ? userId : userId.toString();
    
    const settings = await settingsCollection.findOne({ userId: userIdStr });
    
    if (!settings || !settings.alertAccessEnabled) {
      return res.status(403).json({ message: 'Alert access is not enabled' });
    }

    // Save location update to location_history collection
    const locationHistoryCollection = db.collection('location_history');
    
    const locationUpdate = {
      userId: userIdStr,
      latitude,
      longitude,
      accuracy: accuracy || null,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      createdAt: new Date(),
    };

    await locationHistoryCollection.insertOne(locationUpdate);

    // Update user's current location in user_settings
    await settingsCollection.updateOne(
      { userId: userIdStr },
      {
        $set: {
          currentLatitude: latitude,
          currentLongitude: longitude,
          lastLocationUpdate: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return res.status(200).json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating location:', error);
    return res.status(500).json({ message: 'Failed to update location' });
  }
}



