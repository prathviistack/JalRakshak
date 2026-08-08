import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotificationsThunk,
  markAsReadThunk,
  markAllAsReadThunk,
} from "../../redux/notification/notificationSlice.js";

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const dispatch = useDispatch();
  const { items, unreadCount, status } = useSelector((state) => state.notification);

  useEffect(() => {
    dispatch(fetchNotificationsThunk());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) dispatch(fetchNotificationsThunk());
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink/70 hover:bg-river-50 hover:text-river-800"
      >
        <span aria-hidden="true">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-alert-red px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-river-100 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-river-100 px-4 py-2">
            <span className="text-sm font-medium text-river-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllAsReadThunk())}
                className="text-xs text-river-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {status === "loading" && <p className="px-4 py-6 text-center text-xs text-ink/40">Loading…</p>}
            {status === "succeeded" && items.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-ink/40">You're all caught up.</p>
            )}
            {items.map((n) => (
              <button
                key={n._id}
                onClick={() => !n.isRead && dispatch(markAsReadThunk(n._id))}
                className={`block w-full border-b border-river-50 px-4 py-3 text-left text-sm last:border-b-0 ${
                  n.isRead ? "bg-white" : "bg-river-50/60"
                } hover:bg-river-50`}
              >
                <p className="font-medium text-ink">{n.title}</p>
                <p className="mt-0.5 text-xs text-ink/60">{n.message}</p>
                <p className="mt-1 font-mono text-[10px] text-ink/35">{timeAgo(n.createdAt)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
