import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchRequestsThunk, createRequestThunk } from "../../redux/request/requestSlice.js";
import { uploadRequestMedia } from "../../services/uploadAPI.js";
import * as chatAPI from "../../services/chatAPI.js";

const TYPES = ["rescue", "medical", "food", "shelter", "water", "other"];
const URGENCY = ["low", "medium", "high", "critical"];

const statusColor = {
  pending: "bg-alert-amber/20 text-alert-amber",
  accepted: "bg-river-100 text-river-800",
  in_progress: "bg-river-100 text-river-800",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-ink/10 text-ink/50",
};

const VictimDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items, status } = useSelector((state) => state.request);

  const [form, setForm] = useState({
    type: "rescue",
    urgency: "high",
    description: "",
    numberOfPeople: 1,
    district: user?.district || "",
    address: "",
  });
  const [files, setFiles] = useState(null);

  useEffect(() => {
    dispatch(fetchRequestsThunk());
  }, [dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMessage = async (r) => {
    try {
      await chatAPI.startChat(r.volunteer._id, r._id);
      navigate("/chat");
    } catch (err) {
      toast.error("Could not start conversation");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!navigator.geolocation) {
      toast.error("Geolocation isn't available on this device. Please enable location access.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const payload = {
          ...form,
          lng: pos.coords.longitude,
          lat: pos.coords.latitude,
        };
        const result = await dispatch(createRequestThunk(payload));
        if (createRequestThunk.fulfilled.match(result)) {
          toast.success("SOS request sent. Volunteers nearby have been notified.");
          if (files && files.length > 0) {
            try {
              await uploadRequestMedia(result.payload._id, files);
              toast.success("Photos/videos attached");
            } catch (err) {
              toast.error("Request sent, but photo upload failed");
            }
          }
          setForm({ ...form, description: "" });
          setFiles(null);
        } else {
          toast.error(result.payload || "Could not send request");
        }
      },
      () => toast.error("Location access is required to send an accurate SOS request.")
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-semibold text-river-900">
        Hello, {user?.name?.split(" ")[0] || "there"}
      </h1>
      <p className="mt-1 text-sm text-ink/60">Raise a new SOS request or track your existing ones.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* New SOS form */}
        <form onSubmit={handleSubmit} className="card h-fit space-y-4">
          <h2 className="font-display text-lg font-semibold text-river-900">New SOS</h2>

          <div>
            <label className="label">Type of help</label>
            <select className="input" name="type" value={form.type} onChange={handleChange}>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Urgency</label>
            <select className="input" name="urgency" value={form.urgency} onChange={handleChange}>
              {URGENCY.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">District</label>
            <input className="input" name="district" required value={form.district} onChange={handleChange} placeholder="e.g. Kamrup" />
          </div>

          <div>
            <label className="label">Address / landmark</label>
            <input className="input" name="address" value={form.address} onChange={handleChange} />
          </div>

          <div>
            <label className="label">Number of people</label>
            <input className="input" type="number" min={1} name="numberOfPeople" value={form.numberOfPeople} onChange={handleChange} />
          </div>

          <div>
            <label className="label">Describe your situation</label>
            <textarea className="input" rows={4} name="description" required value={form.description} onChange={handleChange} />
          </div>

          <div>
            <label className="label">Photos/video (optional)</label>
            <input
              className="input file:mr-3 file:rounded file:border-0 file:bg-river-100 file:px-3 file:py-1 file:text-xs file:text-river-800"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => setFiles(e.target.files)}
            />
          </div>

          <button type="submit" className="btn-sos w-full">Send SOS — uses my current location</button>
        </form>

        {/* Request history */}
        <div>
          <h2 className="font-display text-lg font-semibold text-river-900">Your requests</h2>
          {status === "loading" && <p className="mt-3 text-sm text-ink/50">Loading…</p>}
          {status === "succeeded" && items.length === 0 && (
            <p className="mt-3 text-sm text-ink/50">No requests yet. Once you raise an SOS, it'll show up here.</p>
          )}
          <ul className="mt-4 space-y-3">
            {items.map((r) => (
              <li key={r._id} className="card">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize text-river-900">{r.type} — {r.urgency}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${statusColor[r.status]}`}>
                    {r.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink/70">{r.description}</p>
                <p className="mt-2 font-mono text-xs text-ink/40">{r.district} · {new Date(r.createdAt).toLocaleString()}</p>
                {r.media?.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {r.media.map((m) => (
                      <a key={m.publicId} href={m.url} target="_blank" rel="noreferrer">
                        {m.type === "video" ? (
                          <video src={m.url} className="h-14 w-14 rounded object-cover" muted />
                        ) : (
                          <img src={m.url} alt="Attached evidence" className="h-14 w-14 rounded object-cover" />
                        )}
                      </a>
                    ))}
                  </div>
                )}
                {r.volunteer && (
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-river-600">Volunteer: {r.volunteer.name} ({r.volunteer.phone})</p>
                    <button onClick={() => handleMessage(r)} className="btn-secondary px-3 py-1 text-xs">
                      Message
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VictimDashboard;
