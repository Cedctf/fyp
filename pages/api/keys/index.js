import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { createApiKey, listApiKeys, revokeApiKey, updateApiKeyStatus } from "@/lib/api-keys";

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.id; // Ensure your session callback populates user.id

    if (req.method === 'GET') {
        try {
            const keys = await listApiKeys(userId);
            return res.status(200).json({ keys });
        } catch (error) {
            console.error("Error listing keys:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else if (req.method === 'POST') {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ error: "Name is required" });
            }
            const newKey = await createApiKey(userId, name);
            return res.status(201).json({ key: newKey });
        } catch (error) {
            console.error("Error creating key:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { keyId } = req.query;
            if (!keyId) {
                return res.status(400).json({ error: "Key ID is required" });
            }
            await revokeApiKey(keyId, userId);
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error("Error revoking key:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else if (req.method === 'PUT') {
        try {
            const { keyId, status } = req.body;
            if (!keyId || !status) {
                return res.status(400).json({ error: "Key ID and status are required" });
            }
            if (!['active', 'inactive'].includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }
            await updateApiKeyStatus(keyId, userId, status);
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error("Error updating key status:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
