import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getDatabase } from "@/lib/mongodb";

export default async function handler(req, res) {
    // 1. Check Authentication
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    // 2. Check Admin Role
    if (session.user.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    // 3. Fetch Logs
    try {
        const db = await getDatabase();
        const collection = db.collection('audit_logs');

        // Optional: Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const logs = await collection
            .find({})
            .sort({ timestamp: -1 }) // Newest first
            .skip(skip)
            .limit(limit)
            .toArray();

        const total = await collection.countDocuments();

        return res.status(200).json({
            message: "Success",
            meta: {
                total,
                page,
                limit,
                timestamp: new Date().toISOString()
            },
            data: logs
        });

    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
