import { Link } from "react-router-dom";

const stats = [
  { label: "Districts covered", value: "27+" },
  { label: "Avg. volunteer response", value: "18 min" },
  { label: "Active relief camps", value: "Live" },
];

const roles = [
  {
    title: "I need help",
    desc: "Raise an SOS for rescue, medical aid, food, water, or shelter. Volunteers nearby are notified instantly.",
    to: "/register",
    cta: "Request help",
    tone: "sos",
  },
  {
    title: "I can volunteer",
    desc: "See emergencies near you on a live map, accept a request, and coordinate pickup or rescue.",
    to: "/register",
    cta: "Join as volunteer",
    tone: "primary",
  },
  {
    title: "I run an NGO",
    desc: "Manage relief camps, track resource stock, and post announcements to affected districts.",
    to: "/register",
    cta: "Register organization",
    tone: "secondary",
  },
];

const Home = () => (
  <div>
    {/* Hero */}
    <section className="border-b border-river-100 bg-river-800 text-white">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-river-100/70">
          Assam · Flood Season Coordination
        </p>
        <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
          When the water rises, help shouldn't have to search for you.
        </h1>
        <p className="mt-4 max-w-xl text-river-50/90">
          JalRakshak connects flood-affected residents with volunteers, NGOs, and relief camps in
          real time — one SOS request, tracked from raised to resolved.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/register" className="btn-sos">
            Raise an SOS
          </Link>
          <Link to="/relief-camps" className="rounded-md border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/10">
            Find a relief camp
          </Link>
        </div>

        {/* Signature: waterline stat strip */}
        <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/15 pt-6">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-xs text-river-100/60">{s.label}</dt>
              <dd className="font-display text-2xl font-semibold text-alert-amber">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>

    {/* Role picker */}
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="font-display text-2xl font-semibold text-river-900">Find your role</h2>
      <p className="mt-1 text-ink/60">Every account on JalRakshak has one of these roles.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {roles.map((r) => (
          <div key={r.title} className="card flex flex-col">
            <h3 className="font-display text-lg font-semibold text-river-900">{r.title}</h3>
            <p className="mt-2 flex-1 text-sm text-ink/70">{r.desc}</p>
            <Link
              to={r.to}
              className={r.tone === "sos" ? "btn-sos mt-4" : r.tone === "primary" ? "btn-primary mt-4" : "btn-secondary mt-4"}
            >
              {r.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default Home;
