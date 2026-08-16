import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as requestAPI from "../../services/requestAPI.js";
import * as chatAPI from "../../services/chatAPI.js";

const urgencyColor = {
  low: "bg-ink/10 text-ink/60",
  medium: "bg-river-100 text-river-800",
  high: "bg-alert-amber/20 text-alert-amber",
  critical: "bg-alert-red/15 text-alert-red",
};

const VolunteerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [nearby, setNearby] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { requests } = await requestAPI.getNearbyRequests({
            lng: pos.coords.longitude,
            lat: pos.coords.latitude,
          });
          setNearby(requests);
        });
      }
      const { requests: mine } = await requestAPI.getRequests({ status: "assigned" });
      setAssigned(mine);
    } catch (err) {
      toast.error("Could not load emergencies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAccept = async (id) => {
    try {
      await requestAPI.updateRequest(id, { status: "accepted" });
      toast.success("Request accepted — head to the location");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not accept request");
    }
  };

  const handleComplete = async (id) => {
    try {
      await requestAPI.updateRequest(id, { status: "completed" });
      toast.success("Marked as completed");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update request");
    }
  };

  const handleMessage = async (request) => {
    try {
      await chatAPI.startChat(request.victim._id || request.victim, request._id);
      navigate("/chat");
    } catch (err) {
      toast.error("Could not start conversation");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-river-900">
            Volunteer, {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-ink/60">{user?.district || "Your district"} · {user?.isAvailable ? "Available" : "Unavailable"}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-lg font-semibold text-river-900">Nearby emergencies</h2>
          {loading && <p className="mt-3 text-sm text-ink/50">Loading…</p>}
          {!loading && nearby.length === 0 && (
            <p className="mt-3 text-sm text-ink/50">No pending emergencies near you right now.</p>
          )}
          <ul className="mt-4 space-y-3">
            {nearby.map((r) => (
              <li key={r._id} className="card">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize text-river-900">{r.type}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${urgencyColor[r.urgency]}`}>
                    {r.urgency}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink/70">{r.description}</p>
<p className="mt-1 font-mono text-xs text-ink/40">{r.district} · {r.numberOfPeople} people</p>
{r.media?.length > 0 && (
  <div className="mt-2 flex gap-2">
    {r.media.map((m) => (
      <a key={m.publicId} href={m.url} target="_blank" rel="noreferrer">
        {m.type === "video" ? (
          <video src={m.url} className="h-14 w-14 rounded object-cover" muted />
        ) : (
          <img src={m.url} alt="Evidence from victim" className="h-14 w-14 rounded object-cover" />
        )}
      </a>
    ))}
  </div>
)}
<button onClick={() => handleAccept(r._id)} className="btn-primary mt-3 w-full">
  Accept
</button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-river-900">Your assigned tasks</h2>
          {assigned.length === 0 && <p className="mt-3 text-sm text-ink/50">You haven't accepted any requests yet.</p>}
          <ul className="mt-4 space-y-3">
            {assigned.map((r) => (
              <li key={r._id} className="card">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize text-river-900">{r.type}</span>
                  <span className="rounded-full bg-river-100 px-2 py-1 text-xs font-medium capitalize text-river-800">
                    {r.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink/70">{r.description}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleMessage(r)} className="btn-secondary flex-1">
                    Message
                  </button>
                  {r.status !== "completed" && (
                    <button onClick={() => handleComplete(r._id)} className="btn-primary flex-1">
                      Mark completed
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
