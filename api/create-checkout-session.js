const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send({ error: 'Method not allowed' });
  try {
    const { photoId } = req.body;
    if (!photoId) return res.status(400).send({ error: 'photoId required' });

    const PRICE_MAP = { p1: 199, p2: 299 };
    const amount = PRICE_MAP[photoId];
    if (!amount) return res.status(400).send({ error: 'Photo not found or not for sale' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: { name: `Photo ${photoId}` },
          unit_amount: amount
        },
        quantity: 1
      }],
      success_url: `${process.env.SUCCESS_URL || 'https://example.com' }/?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CANCEL_URL || 'https://example.com' }/?canceled=1`
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
