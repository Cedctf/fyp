import { randomBytes, createHash } from 'crypto';
import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'api_keys';

/**
 * Generates a new API key.
 * Format: fyp_sk_<random_hex>
 */
export function generateApiKey() {
    const buffer = randomBytes(32);
    return `fyp_sk_${buffer.toString('hex')}`;
}

/**
 * Hashes an API key for storage.
 * We should never store the raw key.
 */
export function hashApiKey(apiKey) {
    return createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Creates a new API key for a user.
 * Returns the raw key (to be shown ONCE) and the created record.
 */
export async function createApiKey(userId, name) {
    const db = await getDatabase();
    const rawKey = generateApiKey();
    const hashedKey = hashApiKey(rawKey);

    const apiKeyRecord = {
        userId: new ObjectId(userId),
        name,
        key: hashedKey, // Store hash
        prefix: rawKey.substring(0, 10), // Store prefix for identification (fyp_sk_...)
        createdAt: new Date(),
        lastUsed: null,
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(apiKeyRecord);

    return {
        ...apiKeyRecord,
        _id: result.insertedId,
        rawKey, // Return raw key only here
    };
}

/**
 * Validates an API key.
 * Returns the key record if valid, null otherwise.
 */
export async function validateApiKey(apiKey) {
    const db = await getDatabase();
    const hashedKey = hashApiKey(apiKey);

    const keyRecord = await db.collection(COLLECTION_NAME).findOne({ key: hashedKey });

    if (keyRecord) {
        // Update last used asynchronously
        db.collection(COLLECTION_NAME).updateOne(
            { _id: keyRecord._id },
            { $set: { lastUsed: new Date() } }
        );
    }

    return keyRecord;
}

/**
 * Lists API keys for a user.
 */
export async function listApiKeys(userId) {
    const db = await getDatabase();
    return db.collection(COLLECTION_NAME)
        .find({ userId: new ObjectId(userId) })
        .project({ key: 0 }) // Do not return the hashed key
        .sort({ createdAt: -1 })
        .toArray();
}

/**
 * Revokes (deletes) an API key.
 */
export async function revokeApiKey(keyId, userId) {
    const db = await getDatabase();
    return db.collection(COLLECTION_NAME).deleteOne({
        _id: new ObjectId(keyId),
        userId: new ObjectId(userId),
    });
}
