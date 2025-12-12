const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
if (!process.env.MONGODB_URI) {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI not found in .env.local');
    process.exit(1);
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        const db = client.db(process.env.MONGODB_DB || 'auth_app');
        const collection = db.collection('dengue_cases');

        console.log('Reading CSV file...');
        const csvPath = path.join(process.cwd(), 'ultimate_combined_data.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf-8');

        console.log('Parsing CSV data...');
        const records = parseCSV(csvContent);

        if (records.length === 0) {
            console.log('No records found to insert.');
            return;
        }

        console.log(`Found ${records.length} records. Inserting into database...`);

        // Clear existing data
        console.log('Clearing existing data...');
        await collection.deleteMany({});

        // Insert in batches to avoid memory issues or timeouts
        const batchSize = 1000;
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            await collection.insertMany(batch);
            console.log(`Inserted records ${i + 1} to ${Math.min(i + batchSize, records.length)}`);
        }

        console.log('Seeding complete!');

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await client.close();
    }
}

function parseCSV(content) {
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = parseLine(lines[0]);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseLine(lines[i]);
        if (values.length === headers.length) {
            const record = {};
            headers.forEach((header, index) => {
                let value = values[index];

                // Try to convert to number if possible
                if (!isNaN(value) && value.trim() !== '') {
                    value = Number(value);
                }

                // Convert 'TRUE'/'FALSE' to boolean
                if (value === 'TRUE' || value === 'True') value = true;
                if (value === 'FALSE' || value === 'False') value = false;

                // Convert Date strings to Date objects?
                // The CSV has dates like "12/13/2025". 
                // Let's try to parse "Visit_Date" and "Next_Followup_Date"
                if ((header === 'Visit_Date' || header === 'Next_Followup_Date') && typeof value === 'string') {
                    const dateParts = value.split('/');
                    if (dateParts.length === 3) {
                        // Assuming MM/DD/YYYY or DD/MM/YYYY?
                        // CSV line 2: 12/13/2025 -> Month 12, Day 13? Or Day 12, Month 13 (Invalid)?
                        // It's likely MM/DD/YYYY based on 12/13.
                        // Wait, line 2 is P00001, 12/13/2025. 13th month is impossible.
                        // So it must be MM/DD/YYYY.
                        // But wait, 12/13/2025 -> Month 12, Day 13.
                        // Let's check line 3: 12/19/2025.
                        // Line 4: 2/7/2025.
                        // Line 5: 5/13/2025.
                        // Line 142: 12/27/2025.
                        // So format is likely MM/DD/YYYY.
                        // Let's parse it as such.
                        const month = parseInt(dateParts[0], 10) - 1; // 0-indexed
                        const day = parseInt(dateParts[1], 10);
                        const year = parseInt(dateParts[2], 10);
                        const dateObj = new Date(year, month, day);
                        if (!isNaN(dateObj.getTime())) {
                            value = dateObj;
                        }
                    }
                }

                record[header] = value;
            });
            data.push(record);
        }
    }

    return data;
}

function parseLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else {
                // Toggle quotes
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

seed();
