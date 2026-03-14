// pages/api/auth/send-otp.js
import { getServerSession } from "next-auth";
import { authOptions } from "./[...nextauth]";
import { getUsersCollection } from "@/lib/mongodb";
import { sendVerificationOtp } from "@/lib/twilio";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    console.log("Sending OTP to:", phone);
    const result = await sendVerificationOtp(phone);

    const usersCollection = await getUsersCollection();

    await usersCollection.updateOne(
      { email: session.user.email },
      {
        $set: {
          phone,
          phoneVerified: false,
          updatedAt: new Date(),
        },
      }
    );

    return res.status(200).json({
      success: true,
      sid: result.sid,
      status: result.status,
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to send OTP",
    });
  }
}
