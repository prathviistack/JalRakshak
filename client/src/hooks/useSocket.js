import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { connectSocket, disconnectSocket } from "../services/socket.js";
import { upsertFromSocket } from "../redux/request/requestSlice.js";
import { receiveLiveNotification } from "../redux/notification/notificationSlice.js";

/**
 * Mount once near the app root (see App.jsx). Connects the socket when the
 * user is authenticated, tears it down on logout, and fans incoming events
 * out to the relevant Redux slices so any connected component re-renders
 * without a manual refetch.
 */
const useSocket = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return undefined;
    }

    const socket = connectSocket();

    const handleNewEmergency = (request) => {
      dispatch(upsertFromSocket(request));
      if (user?.role === "volunteer") {
        toast(`New ${request.type} SOS in ${request.district}`, { icon: "🚨" });
      }
    };

    const handleRequestAccepted = (request) => {
      dispatch(upsertFromSocket(request));
      if (user?.role === "victim" && request.victim === user._id) {
        toast.success(`A volunteer accepted your ${request.type} request`);
      }
    };

    const handleRequestCompleted = (request) => {
      dispatch(upsertFromSocket(request));
    };


    const handleWeatherAlert = (alert) => {
      toast.error(`⚠️ ${alert.headline} (${alert.district})`, { duration: 6000 });
    };

    const handleNewAnnouncement = (announcement) => {
      toast(`📢 ${announcement.title}`, { duration: 5000 });
    };

    const handleNewNotification = (notification) => {
  dispatch(receiveLiveNotification(notification));
  toast(notification.title);
};

const handleNewMessage = ({ message }) => {
  // Don't notify the sender about their own message
  // (server emits to all participants, including the sender)
  if (message.sender._id === user?._id) return;

  toast(`💬 ${message.sender.name}: ${message.text}`, { duration: 5000 });

  // Also surface it in the notification bell so it's not missed if the toast is dismissed
  dispatch(
    receiveLiveNotification({
      _id: `msg-${message._id}`,
      title: `New message from ${message.sender.name}`,
      message: message.text,
      type: "message",
      isRead: false,
      createdAt: message.createdAt,
    })
  );
};


    socket.on("newEmergency", handleNewEmergency);
    socket.on("requestAccepted", handleRequestAccepted);
    socket.on("requestCompleted", handleRequestCompleted);
    socket.on("newNotification", handleNewNotification);
    socket.on("weatherAlert", handleWeatherAlert);
    socket.on("newAnnouncement", handleNewAnnouncement);

    return () => {
      socket.off("newEmergency", handleNewEmergency);
      socket.off("requestAccepted", handleRequestAccepted);
      socket.off("requestCompleted", handleRequestCompleted);
      socket.off("newNotification", handleNewNotification);
      socket.off("weatherAlert", handleWeatherAlert);
      socket.off("newAnnouncement", handleNewAnnouncement);
    };
  }, [isAuthenticated, user, dispatch]);
};

export default useSocket;
