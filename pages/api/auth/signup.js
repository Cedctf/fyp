import bcrypt from "bcryptjs";

// TODO: Replace with actual database
// This is a mock database - replace with your actual database
const users = [];

function getUserByEmail(email) {
  return users.find(user => user.email === email);
}

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

    // TODO: Check if user already exists in your database
    const existingUser = getUserByEmail(email);
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'An account with this email already exists' 
      });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    // TODO: Save user to your database
    // For now, using mock database
    const newUser = {
      id: `${Date.now()}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    // Return success (don't send password back)
    res.status(201).json({ 
      message: 'Account created successfully',
      user: {
        id: newUser.id,
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

