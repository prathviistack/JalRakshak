import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutLocal } from "../../redux/auth/authSlice.js";
import NotificationBell from "../Notification/NotificationBell.jsx";

const dashboardPathByRole = {
  victim: "/victim",
  volunteer: "/volunteer",
  ngo: "/ngo",
  admin: "/admin",
};

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutLocal());
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-river-100 bg-paper/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-river-800">
          <span aria-hidden="true">🌊</span> JalRakshak
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/relief-camps" className="text-ink/70 hover:text-river-800">
            Relief Camps
          </Link>
          <Link to="/resources" className="text-ink/70 hover:text-river-800">
            Resources
          </Link>

          {isAuthenticated ? (
            <>
              <Link to={dashboardPathByRole[user?.role] || "/"} className="text-ink/70 hover:text-river-800">
                Dashboard
              </Link>
              <Link to="/profile" className="text-ink/70 hover:text-river-800">
                Profile
              </Link>
              <Link to="/chat" className="text-ink/70 hover:text-river-800">
                Chat
              </Link>
              <NotificationBell />
              <button onClick={handleLogout} className="btn-secondary">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-ink/70 hover:text-river-800">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Get help / Volunteer
              </Link>
            </>
          )}
        </div>
      </nav>
      {/* waterline signature - a thin rising-tide rule beneath the header */}
      <div className="h-[3px] w-full bg-gradient-to-r from-river-800 via-river-400 to-alert-amber" />
    </header>
  );
};

export default Navbar;
