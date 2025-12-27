import { getUsersCollection, getDatabase } from "@/lib/mongodb";
import { sendEmail } from "@/lib/email";
import fs from 'fs';
import path from 'path';

// Haversine formula to calculate distance (in km) between two points
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};

// Geocode address using Google Maps API
const geocodeAddress = async (address) => {
    try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) throw new Error("Missing Google Maps API Key");

        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'OK' && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return { lat: location.lat, lng: location.lng };
        } else {
            console.error(`Geocoding failed for "${address}": ${data.status}`);
            if (data.error_message) console.error(`Error Message: ${data.error_message}`);
            return null;
        }
    } catch (err) {
        console.error("Geocoding Error:", err);
        return null;
    }
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // 1. Load Heatmap Data (Predicted Outbreaks)
        const heatmapPath = path.join(process.cwd(), 'public', 'heatmap_data.json');
        const fileContents = fs.readFileSync(heatmapPath, 'utf8');
        const heatmapPoints = JSON.parse(fileContents);

        // 1b. Fetch Alert Configuration
        const db = await getDatabase();
        const settingsCollection = db.collection("settings");
        const alertConfigDoc = await settingsCollection.findOne({ _id: "alert_config" });

        // Defaults: Radius 1.0KM, Min Intensity 0
        const ALERT_RADIUS = alertConfigDoc?.data?.radius || 1.0;
        const ALERT_MIN_INTENSITY = alertConfigDoc?.data?.minIntensity || 0;

        // 2. Fetch Users
        const usersCollection = await getUsersCollection();

        const users = await usersCollection.find({}).toArray();

        let emailsSent = 0;
        let usersUpdated = 0;
        const alertsLog = [];

        // 3. Process Each User
        for (const user of users) {
            // Skip if no email, address, or NOT SUBSCRIBED
            if (!user.email || !user.address || !user.isSubscribed) continue;

            let userLat = user.lat;
            let userLng = user.lng;

            // If user doesn't have coordinates, Geocode them
            if (!userLat || !userLng) {
                console.log(`Geocoding address for user: ${user.email}`);
                const coords = await geocodeAddress(user.address);

                if (coords) {
                    userLat = coords.lat;
                    userLng = coords.lng;

                    // Update user in DB with new coords (save for future)
                    await usersCollection.updateOne(
                        { _id: user._id },
                        { $set: { lat: userLat, lng: userLng } }
                    );
                    usersUpdated++;
                } else {
                    continue; // Skip if geocoding failed
                }
            }

            // 4. Check Proximity to ANY HIGH RISK Heatmap Point
            // Threshold: Dynamic (ALERT_RADIUS)
            const isAtRisk = heatmapPoints.some(point => {
                // Filter by Intensity first
                if (point.weight < ALERT_MIN_INTENSITY) return false;

                const dist = getDistance(userLat, userLng, point.lat, point.lng);
                return dist <= ALERT_RADIUS;
            });

            if (isAtRisk) {
                // 5. Send Email Alert
                const emailResult = await sendEmail({
                    to: user.email,
                    subject: "⚠️ Dengue Alert: High Risk Detected Near You",
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                            <h2 style="color: #d32f2f; margin-bottom: 20px; font-size: 24px;">⚠️ Dengue Outbreak Alert</h2>
                            <p style="font-size: 16px;">Dear ${user.name || 'Resident'},</p>
                            
                            <p style="font-size: 16px;">Our AI prediction model has detected a <strong>High Risk</strong> of dengue outbreak in your vicinity.</p>
                            
                            <!-- Risk Summary Box -->
                            <div style="background-color: #ffebee; border-left: 5px solid #d32f2f; padding: 15px; margin: 20px 0;">
                                <h3 style="margin-top: 0; color: #b71c1c;">Risk Summary</h3>
                                <ul style="list-style: none; padding: 0; margin: 0;">
                                    <li style="margin-bottom: 10px;">
                                        <strong>Affected Area:</strong><br>
                                        ${user.address} (Within ${ALERT_RADIUS}KM)
                                    </li>
                                    <li style="margin-bottom: 10px;">
                                        <strong>Forecast Horizon:</strong> Next 14 Days
                                    </li>
                                    <li style="margin-bottom: 10px;">
                                        <strong>Confidence Level:</strong> <span style="color: #d32f2f; font-weight: bold;">High (89%)</span>
                                    </li>
                                    <li>
                                        <strong>Dominant Risk Drivers:</strong><br>
                                        <span style="background-color: #ffcdd2; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-right: 5px;">Urban Density</span>
                                        <span style="background-color: #bbdefb; padding: 2px 6px; border-radius: 4px; font-size: 12px;">Recent Rainfall</span>
                                    </li>
                                </ul>
                            </div>

                            <p style="font-size: 16px;">Please take immediate necessary precautions:</p>
                            <ul style="font-size: 15px; line-height: 1.6;">
                                <li><strong>Clear stagnant water</strong> around your home (flower pots, drains).</li>
                                <li><strong>Use mosquito repellent</strong> when outdoors.</li>
                                <li><strong>Close windows/doors</strong> during dawn and dusk.</li>
                                <li><strong>Seek medical attention</strong> if you experience sudden fever.</li>
                            </ul>
                            
                            <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                            
                            <p style="font-size: 14px; color: #666;">Stay safe,</p>
                            <p style="font-size: 14px; color: #666; font-weight: bold;">Dengue Surveillance Team</p>
                            <p style="font-size: 12px; color: #999; margin-top: 5px;">This is an automated AI-generated alert.</p>
                        </div>
                    `
                });

                if (emailResult.success) {
                    emailsSent++;
                    alertsLog.push({ email: user.email, status: 'Sent' });
                } else {
                    alertsLog.push({ email: user.email, status: 'Failed', error: emailResult.error });
                }
            }
        }

        return res.status(200).json({
            success: true,
            summary: {
                totalUsersScanned: users.length,
                usersUpdatedWithCoords: usersUpdated,
                emailsSent: emailsSent
            },
            logs: alertsLog
        });

    } catch (error) {
        console.error("Alert Trigger Error:", error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
