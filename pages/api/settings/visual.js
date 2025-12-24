import { getDatabase } from "../../../lib/mongodb";

export default async function handler(req, res) {
    try {
        const db = await getDatabase();
        const settingsCollection = db.collection("settings");

        if (req.method === "GET") {
            // Fetch visual settings
            const settings = await settingsCollection.findOne({ _id: "visual_calibration" });

            // Return defaults if not found, otherwise return stored settings
            if (!settings) {
                return res.status(200).json({}); // Empty object lets frontend use its defaults
            }

            return res.status(200).json(settings.data || {});

        } else if (req.method === "POST") {
            // Save visual settings
            const data = req.body;

            // Validate basic structure (optional but good practice)
            if (!data || typeof data !== 'object') {
                return res.status(400).json({ error: "Invalid data format" });
            }

            await settingsCollection.updateOne(
                { _id: "visual_calibration" },
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
