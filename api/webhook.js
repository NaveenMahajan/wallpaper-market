const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');
const purchasesFile = path.join(__dirname, 'purchases.json');

module.exports = async (req, res) => {
  // Minimal webhook: in production verify signature
  try {
    const event = req.body;
    if (event && event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // session.metadata.photoId might be set in production
      const photoId = session.metadata && session.metadata.photoId;
      if (photoId) {
        let purchases = {};
        if (fs.existsSync(purchasesFile)) purchases = JSON.parse(fs.readFileSync(purchasesFile));
        purchases[photoId] = true;
        fs.writeFileSync(purchasesFile, JSON.stringify(purchases, null, 2));
      }
    }
    res.status(200).json({ received: true });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
};
