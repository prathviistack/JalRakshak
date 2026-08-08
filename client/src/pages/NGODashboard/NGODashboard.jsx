import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient.js";

const NGODashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [shelters, setShelters] = useState([]);
  const [resources, setResources] = useState([]);
  const [announcement, setAnnouncement] = useState({ title: "", body: "" });
  const [posting, setPosting] = useState(false);

  const load = async () => {
    try {
      const [{ data: shelterData }, { data: resourceData }] = await Promise.all([
        apiClient.get("/shelter/all", { params: { district: user?.district } }),
        apiClient.get("/resource/all", { params: { district: user?.district } }),
      ]);
      setShelters(shelterData.shelters);
      setResources(resourceData.resources);
    } catch (err) {
      toast.error("Could not load dashboard data");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcement.title.trim() || !announcement.body.trim()) return;
    setPosting(true);
    try {
      await apiClient.post("/ngo/announcement", { ...announcement, district: user?.district });
      toast.success("Announcement posted");
      setAnnouncement({ title: "", body: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not post announcement");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-semibold text-river-900">
        {user?.organizationName || user?.name}
      </h1>
      <p className="mt-1 text-sm text-ink/60">Relief camps and resources in {user?.district || "your district"}.</p>

      <form onSubmit={handlePostAnnouncement} className="card mt-8 space-y-3">
        <h2 className="font-display text-lg font-semibold text-river-900">Post an announcement</h2>
        <input
          className="input"
          placeholder="Title"
          value={announcement.title}
          onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
        />
        <textarea
          className="input"
          rows={2}
          placeholder="Message to residents in your district…"
          value={announcement.body}
          onChange={(e) => setAnnouncement({ ...announcement, body: e.target.value })}
        />
        <button type="submit" disabled={posting} className="btn-primary">
          {posting ? "Posting…" : "Post to district"}
        </button>
      </form>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-lg font-semibold text-river-900">Relief camps</h2>
          {shelters.length === 0 && <p className="mt-3 text-sm text-ink/50">No camps registered yet.</p>}
          <ul className="mt-4 space-y-3">
            {shelters.map((s) => {
              const rate = s.capacity ? Math.round((s.currentOccupancy / s.capacity) * 100) : 0;
              return (
                <li key={s._id} className="card">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-river-900">{s.name}</span>
                    <span className="font-mono text-xs text-ink/50">{s.currentOccupancy}/{s.capacity}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink/50">{s.address}</p>
                  {/* waterline occupancy indicator */}
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-river-100">
                    <div
                      className="h-full bg-river-600"
                      style={{ width: `${Math.min(rate, 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-river-900">Resource stock</h2>
          {resources.length === 0 && <p className="mt-3 text-sm text-ink/50">No resources logged yet.</p>}
          <ul className="mt-4 space-y-3">
            {resources.map((r) => (
              <li key={r._id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium text-river-900">{r.name}</p>
                  <p className="text-xs capitalize text-ink/50">{r.category}</p>
                </div>
                <span className="font-mono text-sm text-river-800">{r.quantity} {r.unit}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default NGODashboard;
