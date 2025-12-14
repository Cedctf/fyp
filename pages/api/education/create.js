import { getArticlesCollection } from '../../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { title, category, excerpt, content, imageUrl } = req.body;

        // Basic validation
        if (!title || !category || !content) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const collection = await getArticlesCollection();

        const result = await collection.insertOne({
            title,
            category,
            excerpt,
            content,
            imageUrl, // In a real app, this should be an uploaded file path/URL
            readTime: `${Math.ceil(content.split(' ').length / 200)} min read`, // Simple read time calc
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            createdAt: new Date(),
            status: 'pending', // Default status
        });

        res.status(201).json({ message: 'Article submitted for review', articleId: result.insertedId });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
