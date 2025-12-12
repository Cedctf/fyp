import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getUserSettings, updateUserSettings } from "@/lib/settings";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = session.user.id;

  if (req.method === 'GET') {
    try {
      const settings = await getUserSettings(userId);
      return res.status(200).json({
        locationAccessEnabled: settings.locationAccessEnabled || false,
        alertAccessEnabled: settings.alertAccessEnabled || false
      });
    } catch (error) {
      console.error('Error fetching location settings:', error);
      return res.status(500).json({ message: 'Failed to fetch location settings' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { locationAccessEnabled, alertAccessEnabled } = req.body;

      const updateData = {};

      if (typeof locationAccessEnabled === 'boolean') {
        updateData.locationAccessEnabled = locationAccessEnabled;
      }

      if (typeof alertAccessEnabled === 'boolean') {
        updateData.alertAccessEnabled = alertAccessEnabled;
      }

      await updateUserSettings(userId, updateData);

      return res.status(200).json({ message: 'Settings updated successfully' });
    } catch (error) {
      console.error('Error updating location settings:', error);
      return res.status(500).json({ message: 'Failed to update location settings' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

