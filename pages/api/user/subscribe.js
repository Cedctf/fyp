import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getUsersCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const usersCollection = await getUsersCollection();
    const userId = new ObjectId(session.user.id);

    if (req.method === 'GET') {
        try {
            const user = await usersCollection.findOne({ _id: userId });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            return res.status(200).json({ isSubscribed: !!user.isSubscribed });
        } catch (error) {
            console.error("Error fetching subscription status:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else if (req.method === 'POST') {
        try {
            const user = await usersCollection.findOne({ _id: userId });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const newStatus = !user.isSubscribed;
            await usersCollection.updateOne(
                { _id: userId },
                { $set: { isSubscribed: newStatus, updatedAt: new Date() } }
            );

            return res.status(200).json({ isSubscribed: newStatus });
        } catch (error) {
            console.error("Error toggling subscription:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
