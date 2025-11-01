const fs = require('fs');
const path = require('path');
const purchasesFile = path.join(__dirname, '..', 'purchases.json');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const auth = (req.headers.authorization || '');
    const token = auth.replace('Bearer ', '').trim();
    if (!token || token !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: 'unauthorized' });
    const { photoId } = req.body;
    if (!photoId) return res.status(400).json({ error: 'photoId required' });

    let purchases = {};
    if (fs.existsSync(purchasesFile)) purchases = JSON.parse(fs.readFileSync(purchasesFile));
    purchases[photoId] = true;
    fs.writeFileSync(purchasesFile, JSON.stringify(purchases, null, 2));
    // optionally return photos metadata
    const photos = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'photos.json')));
    res.status(200).json({ ok: true, photos });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
};
