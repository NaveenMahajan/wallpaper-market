const fs = require('fs');
const path = require('path');
const purchasesFile = path.join(__dirname, 'purchases.json');

module.exports = async (req, res) => {
  try {
    const photoId = req.query.photoId || (req.body && req.body.photoId);
    if (!photoId) return res.status(400).json({ error: 'photoId required' });
    // read purchases (demo)
    let purchases = {};
    if (fs.existsSync(purchasesFile)) {
      purchases = JSON.parse(fs.readFileSync(purchasesFile));
    }
    // if purchased, return HD map
    if (purchases[photoId]) {
      const HD_MAP = { p1: 'https://picsum.photos/id/1016/1920/1080', p2: 'https://picsum.photos/id/1011/1920/1080', p3: 'https://picsum.photos/id/1022/1920/1080' };
      return res.status(200).json({ url: HD_MAP[photoId] || null });
    } else {
      return res.status(403).json({ error: 'not purchased' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
};
