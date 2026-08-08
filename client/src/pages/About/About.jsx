const About = () => (
  <div className="mx-auto max-w-3xl px-4 py-16">
    <h1 className="font-display text-3xl font-semibold text-river-900">About JalRakshak</h1>
    <p className="mt-4 text-ink/70">
      JalRakshak ("water protector") coordinates disaster response during flood emergencies. It connects
      people who need help with nearby volunteers, and gives NGOs a way to manage relief camps and resources
      in real time — all from one platform.
    </p>

    <div className="mt-8 grid gap-6 sm:grid-cols-3">
      <div className="card">
        <h2 className="font-display text-lg font-semibold text-river-900">For residents</h2>
        <p className="mt-2 text-sm text-ink/70">
          Raise an SOS in seconds. Your location is captured automatically so help finds you faster.
        </p>
      </div>
      <div className="card">
        <h2 className="font-display text-lg font-semibold text-river-900">For volunteers</h2>
        <p className="mt-2 text-sm text-ink/70">
          See nearby emergencies on a live map, accept the ones you can help with, and message the person
          directly.
        </p>
      </div>
      <div className="card">
        <h2 className="font-display text-lg font-semibold text-river-900">For NGOs</h2>
        <p className="mt-2 text-sm text-ink/70">
          Track relief camp occupancy and resource stock across every district you operate in.
        </p>
      </div>
    </div>

    <p className="mt-10 text-sm text-ink/50">
      Built to demonstrate flood response coordination for Assam, but the underlying data model is
      region-agnostic — any state or district can be seeded in.
    </p>
  </div>
);

export default About;
