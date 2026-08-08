import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="mt-16 border-t border-river-100 bg-river-900 text-river-50/80">
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col justify-between gap-6 sm:flex-row">
        <div>
          <p className="font-display text-lg font-semibold text-white">🌊 JalRakshak</p>
          <p className="mt-1 max-w-sm text-sm">
            Coordinating flood relief across Assam — SOS requests, relief camps, and resources, in one place.
          </p>
        </div>
        <div className="flex gap-8 text-sm">
          <div>
            <p className="mb-2 font-medium text-white">Platform</p>
            <ul className="space-y-1">
              <li><Link to="/relief-camps" className="hover:text-white">Relief camps</Link></li>
              <li><Link to="/resources" className="hover:text-white">Resources</Link></li>
              <li><Link to="/register" className="hover:text-white">Get help</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-medium text-white">Company</p>
            <ul className="space-y-1">
              <li><Link to="/about" className="hover:text-white">About</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <p className="mt-8 text-xs text-river-100/50">© {new Date().getFullYear()} JalRakshak. Built for flood relief coordination.</p>
    </div>
  </footer>
);

export default Footer;
