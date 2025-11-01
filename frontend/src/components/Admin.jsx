
import React, { useState } from "react";
import axios from "axios";

export default function Admin({ apiBase, onUpdate }) {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");

  async function markHd(photoId) {
    try {
      const res = await axios.post(`${apiBase || ""}/api/admin/mark-hd`, { photoId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.ok) {
        setMessage("Marked HD available.");
        if (onUpdate && res.data.photos) onUpdate(res.data.photos);
      } else setMessage("Failed");
    } catch (e) {
      console.error(e);
      setMessage("Error. Check token.");
    }
  }

  return (
    <div className="bg-white p-3 rounded shadow">
      <p className="text-sm text-gray-600 mb-2">Use admin token to mark photos as HD (demo).</p>
      <input value={token} onChange={e => setToken(e.target.value)} placeholder="Admin token" className="border p-2 rounded w-full mb-2" />
      <div className="flex gap-2">
        <button onClick={() => markHd("p1")} className="px-3 py-2 bg-indigo-600 text-white rounded">Mark p1 HD</button>
        <button onClick={() => markHd("p2")} className="px-3 py-2 bg-indigo-600 text-white rounded">Mark p2 HD</button>
      </div>
      {message && <div className="mt-2 text-sm">{message}</div>}
    </div>
  );
}
