# FYP Authentication & API System

This project implements a secure authentication system and a public API using Next.js, NextAuth.js, and MongoDB.

## 1. Authentication System

The authentication flow handles user sign-up, login, and session management.

### **Core Components**
- **Configuration**: [`pages/api/auth/[...nextauth].js`](pages/api/auth/[...nextauth].js)
  - Configures **NextAuth.js** providers (Google, GitHub, Credentials).
  - Defines the **JWT Strategy** for sessions.
  - Customizes callbacks to sync MongoDB User IDs with the session.
- **Database Connection**: [`lib/mongodb.js`](lib/mongodb.js)
  - Manages the connection pool to MongoDB.
  - Exports `clientPromise` for NextAuth and helper functions (`getDatabase`, `getUsersCollection`) for the app.

### **How it Works**
1.  **Sign Up**: Users sign up via OAuth or Email/Password.
    -   OAuth users are automatically created in the DB during the `signIn` callback.
    -   Email users are created via the custom sign-up API (if implemented).
2.  **Session**:
    -   On login, a **JWT (JSON Web Token)** is created.
    -   The `jwt` callback fetches the user's `_id` from MongoDB.
    -   The `session` callback exposes this `user.id` to the frontend.
3.  **Protection**:
    -   **Frontend**: `useSession()` hook checks for active sessions.
    -   **Backend**: `getServerSession()` verifies tokens on API routes.

---

## 2. API Key System

The system allows users to generate API keys to access public data programmatically.

### **Architecture**
- **Key Logic**: [`lib/api-keys.js`](lib/api-keys.js)
  - **Generation**: Uses `crypto.randomBytes(32)` to create a secure random string.
  - **Hashing**: Uses **SHA-256** to hash keys before storage.
  - **Storage**: Keys are stored in the `api_keys` collection.
- **Management UI**: [`components/ApiKeyManager.js`](components/ApiKeyManager.js)
  - Allows users to generate, view (once), and revoke keys.

### **Security Model**
1.  **Raw Key**: `fyp_sk_...` (32 bytes of entropy).
    -   **Never Stored**: The raw key is returned to the user **only once** upon generation.
    -   **Verification**: The server hashes the incoming key and compares it to the stored hash.
2.  **Stored Hash**: `SHA256(Raw Key)`.
    -   Stored in the database. Even if the DB is leaked, original keys cannot be recovered.

---

## 3. Public API

External developers can access data using their API keys.

### **Endpoints**
- **Data Endpoint**: [`pages/api/v1/data.js`](pages/api/v1/data.js)
  - **Method**: `GET`
  - **Headers**: `x-api-key: <YOUR_KEY>`
  - **Response**: Returns JSON data (Gaming Stats, Staking Portfolio).

### **Request Flow**
1.  **Client** sends request: `curl -H "x-api-key: fyp_sk_..." https://.../api/v1/data`
2.  **Middleware** (`pages/api/v1/data.js`):
    -   Extracts `x-api-key` header.
    -   Calls `validateApiKey(key)` from `lib/api-keys.js`.
3.  **Validation**:
    -   Hashes the incoming key.
    -   Finds matching hash in `api_keys` collection.
    -   Updates `lastUsed` timestamp.
4.  **Response**:
    -   If valid: Returns 200 OK with data.
    -   If invalid: Returns 403 Forbidden.

---

## 4. File Structure Overview

| Path | Description |
| :--- | :--- |
| **`pages/api/auth/[...nextauth].js`** | Main Auth configuration (Providers, Callbacks). |
| **`lib/mongodb.js`** | MongoDB connection and helpers. |
| **`lib/api-keys.js`** | Core logic for key generation, hashing, and validation. |
| **`components/ApiKeyManager.js`** | UI component for managing keys. |
| **`pages/protected.js`** | User dashboard (Protected Page). |
| **`pages/api/v1/data.js`** | Public API endpoint example. |
