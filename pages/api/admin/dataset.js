// In-memory storage — persists across page navigations but resets on server restart (npm run dev)
let uploadedDatasets = [];
let nextId = 1;

export default function handler(req, res) {
    if (req.method === 'GET') {
        return res.status(200).json(uploadedDatasets);
    }

    if (req.method === 'POST') {
        const { files } = req.body; // Array of { name, size, type }
        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({ error: 'No files provided' });
        }

        const newFiles = files.map((f) => ({
            id: nextId++,
            name: f.name,
            size: f.size,
            type: f.type,
            uploadedAt: new Date().toISOString(),
        }));

        uploadedDatasets.push(...newFiles);
        return res.status(200).json(newFiles);
    }

    if (req.method === 'DELETE') {
        const { id, all } = req.query;

        if (all === 'true') {
            uploadedDatasets = [];
            return res.status(200).json({ message: 'All files cleared' });
        }

        if (id) {
            uploadedDatasets = uploadedDatasets.filter((f) => f.id !== parseInt(id));
            return res.status(200).json({ message: 'File removed' });
        }

        return res.status(400).json({ error: 'Missing id or all parameter' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

