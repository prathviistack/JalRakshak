import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import apiClient from "../../services/apiClient.js";

const STATUS_COLORS = {
  pending: "#F2A93B",
  accepted: "#3E93A6",
  in_progress: "#1C6E8C",
  completed: "#2F9E44",
  cancelled: "#9CA3AF",
};

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    Promise.all([apiClient.get("/request/all"), apiClient.get("/analytics/summary")])
      .then(([{ data: reqData }, { data: analyticsData }]) => {
        setRequests(reqData.requests);
        setSummary(analyticsData);
      })
      .catch(() => toast.error("Could not load platform data"));
  }, []);

  const counts = requests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const districtData = (summary?.requestsByDistrict || []).map((d) => ({
    district: d._id || "Unknown",
    requests: d.count,
  }));

  const statusPieData = (summary?.requestsByStatus || []).map((s) => ({
    name: s._id,
    value: s.count,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-semibold text-river-900">Admin overview</h1>
      <p className="mt-1 text-sm text-ink/60">Platform-wide emergency request status.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {["pending", "accepted", "in_progress", "completed"].map((s) => (
          <div key={s} className="card text-center">
            <p className="font-display text-3xl font-semibold text-river-800">{counts[s] || 0}</p>
            <p className="mt-1 text-xs capitalize text-ink/50">{s.replace("_", " ")}</p>
          </div>
        ))}
      </div>

      {summary && (
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="mb-4 font-display text-lg font-semibold text-river-900">Requests by district</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={districtData}>
                <XAxis dataKey="district" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="requests" fill="#1C6E8C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="mb-4 font-display text-lg font-semibold text-river-900">Requests by status</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {statusPieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#94A3B8"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card lg:col-span-2">
            <h2 className="font-display text-lg font-semibold text-river-900">Shelter capacity</h2>
            <p className="mt-1 text-sm text-ink/60">
              {summary.shelterSummary.totalOccupancy} / {summary.shelterSummary.totalCapacity} people housed across{" "}
              {summary.shelterSummary.camps} camps
            </p>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-river-100">
              <div
                className="h-full bg-river-600"
                style={{
                  width: `${
                    summary.shelterSummary.totalCapacity
                      ? Math.min(
                          (summary.shelterSummary.totalOccupancy / summary.shelterSummary.totalCapacity) * 100,
                          100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-river-900">All requests</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-river-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-river-50 text-xs uppercase text-ink/50">
              <tr>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">District</th>
                <th className="px-4 py-2">Urgency</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Raised</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id} className="border-t border-river-100">
                  <td className="px-4 py-2 capitalize">{r.type}</td>
                  <td className="px-4 py-2">{r.district}</td>
                  <td className="px-4 py-2 capitalize">{r.urgency}</td>
                  <td className="px-4 py-2 capitalize">{r.status.replace("_", " ")}</td>
                  <td className="px-4 py-2 font-mono text-xs text-ink/50">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
