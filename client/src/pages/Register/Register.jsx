import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { registerThunk } from "../../redux/auth/authSlice.js";

const ROLES = [
  { value: "victim", label: "I need help" },
  { value: "volunteer", label: "I can volunteer" },
  { value: "ngo", label: "I run an NGO" },
];

const dashboardPathByRole = {
  victim: "/victim",
  volunteer: "/volunteer",
  ngo: "/ngo",
  admin: "/admin",
};

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "victim",
    district: "",
    organizationName: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerThunk(form));
    if (registerThunk.fulfilled.match(result)) {
      toast.success("Account created");
      navigate(dashboardPathByRole[result.payload.role] || "/");
    } else {
      toast.error(result.payload || "Registration failed");
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-2xl font-semibold text-river-900">Create an account</h1>
      <p className="mt-1 text-sm text-ink/60">Choose the role that fits how you'll use JalRakshak.</p>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4">
        <div>
          <label className="label">I am registering as</label>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setForm({ ...form, role: r.value })}
                className={`rounded-md border px-2 py-2 text-xs font-medium ${
                  form.role === r.value
                    ? "border-river-600 bg-river-50 text-river-800"
                    : "border-river-100 text-ink/60 hover:border-river-400"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input className="input" id="name" name="name" required value={form.name} onChange={handleChange} />
        </div>

        {form.role === "ngo" && (
          <div>
            <label className="label" htmlFor="organizationName">Organization name</label>
            <input className="input" id="organizationName" name="organizationName" value={form.organizationName} onChange={handleChange} />
          </div>
        )}

        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone</label>
          <input className="input" id="phone" name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div>
          <label className="label" htmlFor="district">District</label>
          <input className="input" id="district" name="district" placeholder="e.g. Kamrup" value={form.district} onChange={handleChange} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input className="input" id="password" name="password" type="password" required minLength={6} value={form.password} onChange={handleChange} />
        </div>

        <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
          {status === "loading" ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-ink/60">
        Already have an account? <Link to="/login" className="text-river-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
};

export default Register;
