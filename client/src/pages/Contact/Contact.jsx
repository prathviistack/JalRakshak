import { useState } from "react";
import toast from "react-hot-toast";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // No backend endpoint for contact messages yet - this is a placeholder
    // that would POST to something like /api/contact once built.
    toast.success("Thanks — we'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-3xl font-semibold text-river-900">Contact us</h1>
      <p className="mt-2 text-sm text-ink/60">
        Questions, partnership requests, or feedback on JalRakshak — reach out below.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-4">
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input className="input" id="name" name="name" required value={form.name} onChange={handleChange} />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
        </div>
        <div>
          <label className="label" htmlFor="message">Message</label>
          <textarea className="input" id="message" name="message" rows={4} required value={form.message} onChange={handleChange} />
        </div>
        <button type="submit" className="btn-primary w-full">Send message</button>
      </form>
    </div>
  );
};

export default Contact;
