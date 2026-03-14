// pages/api/auth/verify-otp.js
import { getServerSession } from "next-auth";
import { authOptions } from "./[...nextauth]";
import { getUsersCollection } from "@/lib/mongodb";
import { checkVerificationOtp } from "@/lib/twilio";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: "Phone and OTP code are required" });
    }

    console.log("Verifying OTP for:", phone);
    const result = await checkVerificationOtp(phone, code);

    if (result.status !== "approved") {
      return res.status(400).json({
        success: false,
        status: result.status,
        error: "Invalid or expired OTP",
      });
    }

    const usersCollection = await getUsersCollection();

    await usersCollection.updateOne(
      { email: session.user.email },
      {
        $set: {
          phone,
          phoneVerified: true,
          phoneVerifiedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return res.status(200).json({
      success: true,
      status: result.status,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to verify OTP",
    });
  }
}
