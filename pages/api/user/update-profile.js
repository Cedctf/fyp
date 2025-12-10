import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getUsersCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const { address, phone } = req.body;

        if (!address && !phone) {
            return res.status(400).json({ message: 'No data provided to update' });
        }

        const usersCollection = await getUsersCollection();

        // Update user in database
        const result = await usersCollection.updateOne(
            { email: session.user.email },
            {
                $set: {
                    address: address || "",
                    phone: phone || "",
                    updatedAt: new Date()
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'User not found or no changes made' });
        }

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}
