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

    const handleNewNotification = (notification) => {
      dispatch(receiveLiveNotification(notification));
      toast(notification.title);
    };

    const handleWeatherAlert = (alert) => {
      toast.error(`⚠️ ${alert.headline} (${alert.district})`, { duration: 6000 });
    };

    const handleNewAnnouncement = (announcement) => {
      toast(`📢 ${announcement.title}`, { duration: 5000 });
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
