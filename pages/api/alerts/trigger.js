import { getUsersCollection } from "@/lib/mongodb";
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

        // 2. Fetch Users
        const usersCollection = await getUsersCollection();
        const users = await usersCollection.find({}).toArray();

        let emailsSent = 0;
        let usersUpdated = 0;
        const alertsLog = [];

        // 3. Process Each User
        for (const user of users) {
            // Skip if no email or address
            if (!user.email || !user.address) continue;

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

            // 4. Check Proximity to ANY Heatmap Point
            // Threshold: 1 KM
            const isAtRisk = heatmapPoints.some(point => {
                const dist = getDistance(userLat, userLng, point.lat, point.lng);
                return dist <= 1.0;
            });

            if (isAtRisk) {
                // 5. Send Email Alert
                const emailResult = await sendEmail({
                    to: user.email,
                    subject: "⚠️ Dengue Alert: High Risk Detected Near You",
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                            <h2 style="color: #d32f2f;">Dengue Outbreak Alert</h2>
                            <p>Dear ${user.name || 'Resident'},</p>
                            <p>Our AI prediction model has detected a potential <strong>high risk of dengue outbreak</strong> within 1KM of your registered address:</p>
                            <p style="background-color: #f5f5f5; padding: 10px; border-left: 4px solid #d32f2f;">
                                <strong>${user.address}</strong>
                            </p>
                            <p>Please take necessary precautions:</p>
                            <ul>
                                <li>Clear stagnant water around your home.</li>
                                <li>Use mosquito repellent.</li>
                                <li>Close windows/doors during dawn and dusk.</li>
                            </ul>
                            <p>Stay safe,</p>
                            <p><strong>Dengue Surveillance Team</strong></p>
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
