import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient.js";

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [district, setDistrict] = useState("");

  const load = async (d) => {
    try {
      const { data } = await apiClient.get("/resource/all", { params: d ? { district: d } : {} });
      setResources(data.resources);
    } catch (err) {
      // Resource list requires auth in the current API - guide anonymous visitors accordingly.
      if (err.response?.status === 401) {
        toast.error("Log in to view live resource stock.");
      } else {
        toast.error("Could not load resources");
      }
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-2xl font-semibold text-river-900">Resource availability</h1>
      <p className="mt-1 text-sm text-ink/60">Food, water, medical, and shelter supplies logged by NGOs.</p>

      <div className="mt-6 flex gap-2">
        <input
          className="input max-w-xs"
          placeholder="Filter by district (e.g. Cachar)"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        />
        <button className="btn-secondary" onClick={() => load(district)}>Filter</button>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {resources.map((r) => (
          <li key={r._id} className="card flex items-center justify-between">
            <div>
              <p className="font-medium text-river-900">{r.name}</p>
              <p className="text-xs capitalize text-ink/50">{r.category} · {r.district}</p>
            </div>
            <span className="font-mono text-sm text-river-800">{r.quantity} {r.unit}</span>
          </li>
        ))}
      </ul>

      {resources.length === 0 && <p className="mt-6 text-sm text-ink/50">No resources to show yet.</p>}
    </div>
  );
};

export default Resources;
