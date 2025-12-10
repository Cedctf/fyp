import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUsersCollection } from "@/lib/mongodb";

async function getUserByEmail(email) {
  const usersCollection = await getUsersCollection();
  return await usersCollection.findOne({ email: email.toLowerCase() });
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

        // Get user from MongoDB
        const user = await getUserByEmail(credentials.email);

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // Compare password with hashed password in database
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          address: user.address,
          phone: user.phone,
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
    async jwt({ token, user, account, trigger, session }) {
      // Handle session updates
      if (trigger === "update" && session) {
        token.address = session.user.address;
        token.phone = session.user.phone;
        return token;
      }

      // Persist user data to the token after sign in
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.address = user.address;
        token.phone = user.phone;

        // For OAuth, fetch the user from DB to get the correct _id and additional info
        if (account && (account.provider === "google" || account.provider === "github")) {
          const dbUser = await getUserByEmail(user.email);
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.address = dbUser.address;
            token.phone = dbUser.phone;
          }
        } else {
          // For credentials, user.id is already set correctly in authorize
          token.id = user.id;
        }
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
        session.user.address = token.address;
        session.user.phone = token.phone;
        session.accessToken = token.accessToken;
      }

      return session;
    },

    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          // Check if user exists in MongoDB
          const existingUser = await getUserByEmail(user.email);

          if (!existingUser) {
            // Create new OAuth user in MongoDB
            const usersCollection = await getUsersCollection();
            await usersCollection.insertOne({
              email: user.email.toLowerCase(),
              name: user.name || user.email.split('@')[0],
              image: user.image,
              provider: account.provider,
              providerId: account.providerAccountId,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } else {
            // Update last login time
            const usersCollection = await getUsersCollection();
            await usersCollection.updateOne(
              { email: user.email.toLowerCase() },
              { $set: { updatedAt: new Date() } }
            );
          }
        } catch (error) {
          console.error('Error saving OAuth user:', error);
          return false;
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

