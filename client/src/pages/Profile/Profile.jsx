import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { updateProfileThunk } from "../../redux/auth/authSlice.js";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    district: user?.district || "",
    organizationName: user?.organizationName || "",
    skills: (user?.skills || []).join(", "),
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean) };
    const result = await dispatch(updateProfileThunk(payload));
    setSaving(false);
    if (updateProfileThunk.fulfilled.match(result)) {
      toast.success("Profile updated");
    } else {
      toast.error(result.payload || "Could not update profile");
    }
  };

  const toggleAvailability = async () => {
    const result = await dispatch(updateProfileThunk({ isAvailable: !user.isAvailable }));
    if (updateProfileThunk.fulfilled.match(result)) {
      toast.success(result.payload.isAvailable ? "You're marked available" : "You're marked unavailable");
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-display text-2xl font-semibold text-river-900">Your profile</h1>
      <p className="mt-1 text-sm text-ink/60 capitalize">{user?.role} · {user?.email}</p>

      {user?.role === "volunteer" && (
        <div className="card mt-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-river-900">Availability</p>
            <p className="text-xs text-ink/50">Volunteers marked unavailable won't be shown as accepting new tasks.</p>
          </div>
          <button
            onClick={toggleAvailability}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              user?.isAvailable ? "bg-river-600 text-white" : "bg-ink/10 text-ink/60"
            }`}
          >
            {user?.isAvailable ? "Available" : "Unavailable"}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input className="input" id="name" name="name" value={form.name} onChange={handleChange} />
        </div>

        {user?.role === "ngo" && (
          <div>
            <label className="label" htmlFor="organizationName">Organization name</label>
            <input className="input" id="organizationName" name="organizationName" value={form.organizationName} onChange={handleChange} />
          </div>
        )}

        <div>
          <label className="label" htmlFor="phone">Phone</label>
          <input className="input" id="phone" name="phone" value={form.phone} onChange={handleChange} />
        </div>

        <div>
          <label className="label" htmlFor="district">District</label>
          <input className="input" id="district" name="district" value={form.district} onChange={handleChange} />
        </div>

        {user?.role === "volunteer" && (
          <div>
            <label className="label" htmlFor="skills">Skills (comma separated)</label>
            <input className="input" id="skills" name="skills" placeholder="boat rescue, first aid" value={form.skills} onChange={handleChange} />
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
