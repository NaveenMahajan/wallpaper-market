
import React, { useEffect, useState } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import Admin from "./components/Admin";

const API_BASE = (import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : (process.env.REACT_APP_API_BASE || "");
const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PK || "";
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

const DEMO_PHOTOS = [
  { id: "p1", title: "Sunset Cliffs", author: "Amit", price: 199, lowRes: "https://picsum.photos/id/1016/600/360", type: "photograph", forSale: true, hd: false },
  { id: "p2", title: "City Night", author: "Neha", price: 299, lowRes: "https://picsum.photos/id/1011/600/360", type: "cartoon", forSale: true, hd: false },
  { id: "p3", title: "Mountains", author: "Ravi", price: 0, lowRes: "https://picsum.photos/id/1022/600/360", type: "photograph", forSale: false, hd: false }
];

function api(path, opts = {}) {
  const base = API_BASE || "";
  const url = base ? `${base}/api/${path.replace(/^\/+/,'')}` : `/api/${path.replace(/^\/+/,'')}`;
  return axios(url, opts);
}

export default function App() {
  const [photos, setPhotos] = useState(DEMO_PHOTOS);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // fetch photos metadata from API if available
    (async () => {
      try {
        const res = await api('photos');
        if (res && res.data) setPhotos(res.data);
      } catch (e) {
        // ignore - fallback to demo
      }
    })()
  }, []);

  async function buyPhoto(photo) {
    if (!photo.forSale) { alert("Not for sale"); return; }
    if (!PUBLISHABLE_KEY) { alert("Payments not configured. Set VITE_STRIPE_PK env var."); return; }
    setLoading(true);
    try {
      const resp = await api('create-checkout-session', { method: 'post', data: { photoId: photo.id } });
      const sessionId = resp?.data?.id;
      if (!sessionId) throw new Error('Invalid session');
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe init failed');
      const r = await stripe.redirectToCheckout({ sessionId });
      if (r && r.error) alert(r.error.message || 'Checkout redirect failed');
    } catch (err) {
      console.error(err);
      alert('Failed to start checkout');
    } finally { setLoading(false); }
  }

  async function getHd(photo) {
    setLoading(true);
    try {
      const res = await api('hd-url', { method: 'get', params: { photoId: photo.id } });
      const url = res?.data?.url;
      if (url) window.open(url, '_blank', 'noopener');
      else alert('HD not available or you need to purchase.');
    } catch (err) {
      console.error(err);
      alert('Failed to fetch HD');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">WallpaperMarket</h1>
          <div className="flex items-center gap-3">
            <button className="px-3 py-2 bg-indigo-600 text-white rounded shadow">Sign in</button>
            <button className="px-3 py-2 border rounded">Cart</button>
          </div>
        </header>

        { !PUBLISHABLE_KEY && <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-800">Payments not configured. Buy disabled until VITE_STRIPE_PK is set.</div> }

        <main>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map(p => (
              <article key={p.id} className="bg-white rounded-lg shadow p-3">
                <div className="relative">
                  <img src={p.lowRes} alt={p.title} className="w-full h-48 object-cover rounded" />
                  <div className="absolute left-2 top-2 bg-black/50 text-white text-sm px-2 py-1 rounded">{p.type}</div>
                </div>
                <div className="mt-3 flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold">{p.title}</h2>
                    <p className="text-sm text-gray-500">by {p.author}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{p.price > 0 ? `₹${(p.price/100).toFixed(2)}` : 'Free'}</div>
                    <div className="text-xs text-gray-400">{p.forSale ? (p.hd ? 'HD available' : 'HD for sale') : 'Demo'}</div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => setSelected(p)} className="flex-1 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">Preview</button>
                  {p.forSale ? (
                    <button onClick={() => buyPhoto(p)} disabled={!PUBLISHABLE_KEY || loading} className="px-3 py-2 bg-emerald-500 text-white rounded">{!PUBLISHABLE_KEY ? 'Buy (disabled)' : 'Buy'}</button>
                  ) : (
                    <button onClick={() => getHd(p)} className="px-3 py-2 border rounded">Download</button>
                  )}
                </div>

                <div className="mt-2 text-xs text-gray-500">Low-res displayed by default — HD delivered after purchase.</div>
              </article>
            ))}
          </section>

          {selected && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow max-w-3xl w-full overflow-hidden">
                <div className="p-4 flex items-start gap-4">
                  <div className="w-1/2">
                    <img src={selected.lowRes} className="w-full h-64 object-cover rounded" alt={selected.title} />
                    <div className="mt-2 text-sm text-gray-500">Preview (low-res). Buy to unlock HD.</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selected.title}</h3>
                    <p className="text-sm text-gray-600">by {selected.author}</p>
                    <p className="mt-3">Type: <strong>{selected.type}</strong></p>
                    <div className="mt-4 flex gap-2">
                      {selected.forSale ? (
                        <button onClick={() => buyPhoto(selected)} disabled={!PUBLISHABLE_KEY || loading} className="px-4 py-2 bg-emerald-500 text-white rounded">Buy HD • ₹{(selected.price/100).toFixed(2)}</button>
                      ) : (
                        <button onClick={() => getHd(selected)} className="px-4 py-2 border rounded">Download</button>
                      )}
                      <button onClick={() => setSelected(null)} className="px-4 py-2 border rounded">Close</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-3">Admin</h2>
            <Admin apiBase={API_BASE} onUpdate={setPhotos} />
          </div>

        </main>
      </div>
    </div>
  );
}
