import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

/**
 * Example of a protected API route
 * This route can only be accessed by authenticated users
 */
export default async function handler(req, res) {
  // Get the user's session
  const session = await getServerSession(req, res, authOptions);

  // If no session exists, return 401 Unauthorized
  if (!session) {
    return res.status(401).json({ 
      error: "Unauthorized",
      message: "You must be signed in to access this resource" 
    });
  }

  // User is authenticated, return protected data
  res.status(200).json({ 
    message: "This is protected data",
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
    timestamp: new Date().toISOString(),
  });
}

