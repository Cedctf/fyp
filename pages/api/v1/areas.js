import { validateApiKey } from "@/lib/api-keys";
import { getDatabase } from "@/lib/mongodb";

export default async function handler(req, res) {
    // 1. Check for API key in headers
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ error: "Missing API key" });
    }

    // 2. Validate API key
    const keyRecord = await validateApiKey(apiKey);

    if (!keyRecord) {
        return res.status(403).json({ error: "Invalid API key" });
    }

    // 3. Query Database for distinct areas
    try {
        const db = await getDatabase();
        const collection = db.collection('dengue_cases');

        // Get distinct districts
        const areas = await collection.distinct('District');

        return res.status(200).json({
            message: "Success",
            meta: {
                count: areas.length,
                timestamp: new Date().toISOString(),
                request_id: Math.random().toString(36).substring(7),
            },
            data: areas.sort() // Return sorted list
        });

    } catch (error) {
        console.error("Database query error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
