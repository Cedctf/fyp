import { getArticlesCollection } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    const collection = await getArticlesCollection();

    if (req.method === 'GET') {
        try {
            const { status } = req.query;
            const query = status ? { status } : {};

            const articles = await collection.find(query).sort({ createdAt: -1 }).toArray();
            res.status(200).json(articles);
        } catch (error) {
            console.error('Fetch error:', error);
            res.status(500).json({ message: 'Failed to fetch articles' });
        }
    } else if (req.method === 'PUT') {
        try {
            const { id, status } = req.body;

            if (!id || !status) {
                return res.status(400).json({ message: 'Missing article ID or status' });
            }

            if (!['approved', 'rejected', 'pending'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }

            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { status } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Article not found' });
            }

            res.status(200).json({ message: `Article ${status}` });
        } catch (error) {
            console.error('Update error:', error);
            res.status(500).json({ message: 'Failed to update article' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
