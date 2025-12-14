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

    // 3. Query Database for availability metadata
    try {
        const db = await getDatabase();
        const collection = db.collection('dengue_cases');

        // Aggregation to find min and max date
        const result = await collection.aggregate([
            {
                $group: {
                    _id: null,
                    minDate: { $min: "$Visit_Date" },
                    maxDate: { $max: "$Visit_Date" },
                    totalRecords: { $sum: 1 }
                }
            }
        ]).toArray();

        if (result.length === 0) {
            return res.status(200).json({
                message: "No data available",
                data: null
            });
        }

        const { minDate, maxDate, totalRecords } = result[0];

        return res.status(200).json({
            message: "Success",
            meta: {
                timestamp: new Date().toISOString(),
                request_id: Math.random().toString(36).substring(7),
            },
            data: {
                start_date: minDate,
                end_date: maxDate,
                total_records: totalRecords
            }
        });

    } catch (error) {
        console.error("Database query error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
