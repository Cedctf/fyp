const { MongoClient } = require('mongodb');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
if (!process.env.MONGODB_URI) {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const email = process.argv[2];

if (!email) {
    console.error("Please provide an email address.");
    console.error("Usage: node scripts/promote_admin.js <email>");
    process.exit(1);
}

async function run() {
    try {
        await client.connect();
        const db = client.db(process.env.MONGODB_DB || 'auth_app');
        const collection = db.collection('users');

        const result = await collection.updateOne(
            { email: email.toLowerCase() },
            { $set: { role: 'admin', updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            console.error(`User with email ${email} not found.`);
        } else {
            console.log(`Successfully promoted ${email} to admin.`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

run();
