import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// TODO: Replace these with actual database queries
// This is a mock database - replace with your actual database
const users = [];

async function getUserByEmail(email) {
  // TODO: Replace with actual database query
  return users.find(user => user.email === email);
}

export const authOptions = {
  providers: [
    // OAuth Providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "your-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "your-github-client-id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "your-github-client-secret",
    }),
    // Traditional email/password authentication
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // TODO: Replace with actual database lookup
        const user = await getUserByEmail(credentials.email);
        
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  
  // Configure JWT
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || "your-super-secret-key-change-this",
  },
  
  // Callbacks for customizing JWT and session
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Persist user data to the token after sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      
      // Persist OAuth access token
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Add custom user info to session
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.accessToken = token.accessToken;
      }
      
      return session;
    },
    
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in
      if (account?.provider === "google" || account?.provider === "github") {
        // TODO: Save OAuth user to database if not exists
        // Check if user exists, if not create one
        const existingUser = await getUserByEmail(user.email);
        
        if (!existingUser) {
          // TODO: Create user in database
          users.push({
            id: `${Date.now()}`,
            email: user.email,
            name: user.name || user.email.split('@')[0],
            image: user.image,
            provider: account.provider,
          });
        }
      }
      
      return true;
    },
  },
  
  // Custom pages
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    // signOut: '/auth/signout',
  },
  
  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);

