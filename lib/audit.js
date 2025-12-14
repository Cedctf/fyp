import { getDatabase } from "./mongodb";

/**
 * Logs an activity to the audit_logs collection.
 * 
 * @param {string} userId - The ID of the user performing the action (or "system" / "anonymous").
 * @param {string} action - A short string describing the action (e.g., "USER_SIGNUP", "LOGIN").
 * @param {string} resource - The target resource (e.g., "auth", "api_key").
 * @param {object} details - Additional details about the event.
 */
export async function logActivity(userId, action, resource, details = {}) {
    try {
        const db = await getDatabase();
        const collection = db.collection('audit_logs');

        const logEntry = {
            userId: userId ? userId.toString() : "anonymous",
            action,
            resource,
            details,
            timestamp: new Date(),
            userAgent: details.userAgent || null,
            ip: details.ip || null
        };

        await collection.insertOne(logEntry);
        console.log(`[AUDIT] ${action} by ${userId}`);
    } catch (error) {
        console.error("Failed to write audit log:", error);
        // We don't throw here to avoid breaking the main application flow
    }
}
