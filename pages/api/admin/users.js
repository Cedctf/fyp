import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/audit";

export default async function handler(req, res) {
    // 1. Check Authentication & Admin Role
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // GET: List Users
    if (req.method === 'GET') {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            const users = await usersCollection
                .find({})
                .project({ password: 0 }) // Exclude passwords
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();

            const total = await usersCollection.countDocuments();

            return res.status(200).json({
                message: "Success",
                meta: { total, page, limit },
                data: users
            });
        } catch (error) {
            console.error("Error fetching users:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    // PATCH: Update User Role
    if (req.method === 'PATCH') {
        try {
            const { userId, role } = req.body;

            if (!userId || !['user', 'admin'].includes(role)) {
                return res.status(400).json({ error: "Invalid input" });
            }

            // Prevent self-demotion (optional safety)
            if (userId === session.user.id && role !== 'admin') {
                return res.status(400).json({ error: "You cannot demote yourself." });
            }

            const result = await usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                { $set: { role, updatedAt: new Date() } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            await logActivity(session.user.id, "USER_ROLE_UPDATE", "user", {
                targetUserId: userId,
                newRole: role
            });

            return res.status(200).json({ message: "User role updated" });

        } catch (error) {
            console.error("Error updating user:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    // POST: Create New Admin User
    if (req.method === 'POST') {
        try {
            const { name, email, password } = req.body;

            if (!email || !password || password.length < 8) {
                return res.status(400).json({ error: "Invalid input" });
            }

            const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({ error: "User already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const newUser = {
                name: name || email.split('@')[0],
                email: email.toLowerCase(),
                password: hashedPassword,
                role: 'admin', // Explicitly creating an admin
                provider: 'credentials',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await usersCollection.insertOne(newUser);

            await logActivity(session.user.id, "ADMIN_USER_CREATED", "user", {
                newUserId: result.insertedId,
                email: newUser.email
            });

            return res.status(201).json({ message: "Admin user created successfully" });

        } catch (error) {
            console.error("Error creating admin:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
