// in-memory store (lives as long as the lambda is warm)
const cache = new Map();

export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'POST') {
    // Fly bot pushes here
    const body = req.body;
    if (!id || !body) return res.status(400).json({ error: 'missing id or body' });
    cache.set(id, body);
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    // Your front-end requests here
    if (!id) return res.status(400).json({ error: 'missing ?id=' });
    const data = cache.get(id);
    if (!data) return res.status(404).json({ error: 'not found' });
    return res.json(data);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
