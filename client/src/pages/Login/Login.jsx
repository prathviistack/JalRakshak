import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { loginThunk } from "../../redux/auth/authSlice.js";

const dashboardPathByRole = {
  victim: "/victim",
  volunteer: "/volunteer",
  ngo: "/ngo",
  admin: "/admin",
};

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginThunk(form));
    if (loginThunk.fulfilled.match(result)) {
      toast.success("Welcome back");
      navigate(dashboardPathByRole[result.payload.role] || "/");
    } else {
      toast.error(result.payload || "Login failed");
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-2xl font-semibold text-river-900">Log in</h1>
      <p className="mt-1 text-sm text-ink/60">Access your JalRakshak dashboard.</p>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input className="input" id="password" name="password" type="password" required value={form.password} onChange={handleChange} />
        </div>
        <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
          {status === "loading" ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-4 text-sm text-ink/60">
        New here? <Link to="/register" className="text-river-600 hover:underline">Create an account</Link>
      </p>
    </div>
  );
};

export default Login;
