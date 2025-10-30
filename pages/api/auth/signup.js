import bcrypt from "bcryptjs";
import { getUsersCollection } from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        message: 'Please provide a valid email address' 
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Please provide your name' 
      });
    }

    // Connect to MongoDB
    const usersCollection = await getUsersCollection();

    // Check if user already exists in database
    const existingUser = await usersCollection.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'An account with this email already exists' 
      });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user document
    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: 'credentials',
    };

    // Save user to MongoDB
    const result = await usersCollection.insertOne(newUser);

    // Return success (don't send password back)
    res.status(201).json({ 
      message: 'Account created successfully',
      user: {
        id: result.insertedId.toString(),
        email: newUser.email,
        name: newUser.name,
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'Something went wrong. Please try again.' 
    });
  }
}

