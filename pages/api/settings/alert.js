import { getDatabase } from "../../../lib/mongodb";

export default async function handler(req, res) {
    try {
        const db = await getDatabase();
        const settingsCollection = db.collection("settings");

        if (req.method === "GET") {
            // Fetch alert config
            const settings = await settingsCollection.findOne({ _id: "alert_config" });

            // Return defaults if not found
            // Default: 1.0 KM Radius, 0 Minimum Intensity (Any Risk)
            if (!settings) {
                return res.status(200).json({ radius: 1.0, minIntensity: 0 });
            }

            return res.status(200).json(settings.data || { radius: 1.0, minIntensity: 0 });

        } else if (req.method === "POST") {
            // Save alert config
            const data = req.body;

            // Validate
            if (!data || typeof data.radius !== 'number' || typeof data.minIntensity !== 'number') {
                return res.status(400).json({ error: "Invalid data format. Expected radius (number) and minIntensity (number)." });
            }

            await settingsCollection.updateOne(
                { _id: "alert_config" },
                { $set: { data: data, updatedAt: new Date() } },
                { upsert: true }
            );

            return res.status(200).json({ success: true });
        } else {
            res.setHeader("Allow", ["GET", "POST"]);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (e) {
        console.error("API Error:", e);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
