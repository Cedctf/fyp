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

    // 3. Query Database
    try {
        const db = await getDatabase();
        const collection = db.collection('dengue_cases');

        const { date, start_date, end_date, district, limit = 100 } = req.query;
        const query = {};

        // Date filtering
        if (date) {
            // Match exact date (ignoring time if stored as ISODate, but we stored as Date object at 00:00:00)
            // To be safe, query range for that day
            const queryDate = new Date(date);
            if (!isNaN(queryDate.getTime())) {
                const nextDay = new Date(queryDate);
                nextDay.setDate(nextDay.getDate() + 1);
                query.Visit_Date = {
                    $gte: queryDate,
                    $lt: nextDay
                };
            }
        } else if (start_date || end_date) {
            query.Visit_Date = {};
            if (start_date) query.Visit_Date.$gte = new Date(start_date);
            if (end_date) query.Visit_Date.$lte = new Date(end_date);
        }

        // District filtering
        if (district) {
            query.District = district;
        }

        const cases = await collection.find(query).limit(parseInt(limit)).toArray();

        return res.status(200).json({
            message: "Success",
            meta: {
                count: cases.length,
                timestamp: new Date().toISOString(),
                request_id: Math.random().toString(36).substring(7),
            },
            data: cases
        });

    } catch (error) {
        console.error("Database query error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
