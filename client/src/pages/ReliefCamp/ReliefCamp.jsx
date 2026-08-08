import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient.js";

// Default marker icons don't load correctly with bundlers unless re-pointed to CDN assets.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Rough center of Assam, used as the default map view.
const ASSAM_CENTER = [26.2006, 92.9376];

const ReliefCamp = () => {
  const [shelters, setShelters] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    apiClient
      .get("/shelter/all")
      .then(({ data }) => setShelters(data.shelters))
      .catch(() => toast.error("Could not load relief camps"));

    apiClient.get("/weather/alerts").then(({ data }) => setAlerts(data.alerts)).catch(() => {});
    apiClient.get("/ngo/announcement").then(({ data }) => setAnnouncements(data.announcements)).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-2xl font-semibold text-river-900">Live relief camp map</h1>
      <p className="mt-1 text-sm text-ink/60">
        Shelters currently registered on JalRakshak. Tap a marker for capacity and contact details.
      </p>

      {alerts.length > 0 && (
        <div className="mt-4 space-y-2">
          {alerts.map((a) => (
            <div key={a._id} className="rounded-md border border-alert-red/30 bg-alert-red/10 px-4 py-2 text-sm text-alert-red">
              <span className="font-semibold uppercase">{a.severity}</span> — {a.headline} ({a.district})
            </div>
          ))}
        </div>
      )}

      {announcements.length > 0 && (
        <div className="mt-4 space-y-2">
          {announcements.slice(0, 3).map((a) => (
            <div key={a._id} className="rounded-md border border-river-100 bg-river-50 px-4 py-2 text-sm text-river-900">
              <span className="font-semibold">{a.title}</span> — {a.body}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-river-100">
        <MapContainer center={ASSAM_CENTER} zoom={7} style={{ height: "520px", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {shelters.map((s) => (
            <Marker key={s._id} position={[s.location.coordinates[1], s.location.coordinates[0]]}>
              <Popup>
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs">{s.address}</p>
                <p className="mt-1 text-xs">Occupancy: {s.currentOccupancy}/{s.capacity}</p>
                {s.contactPhone && <p className="text-xs">Phone: {s.contactPhone}</p>}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {shelters.length === 0 && (
        <p className="mt-4 text-sm text-ink/50">
          No relief camps registered yet. NGOs can add camps from their dashboard.
        </p>
      )}
    </div>
  );
};

export default ReliefCamp;
