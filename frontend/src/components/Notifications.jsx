import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Notifications() {
    const { user } = useSelector((state) => state.auth);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visiblePosts, setVisiblePosts] = useState({});
    const url = import.meta.env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`${url}/api/v1/notifications`, { withCredentials: true });

            if (res.data.success) {
                setNotifications(res.data.notifications);
            } else {
                toast.error(res.data.message || "Failed to fetch notifications");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not fetch notifications");
        }
        setLoading(false);
    };

    const togglePostVisibility = (notifId) => {
        setVisiblePosts((prev) => ({
            ...prev,
            [notifId]: !prev[notifId],
        }));
    };

    if (!user) {
        return <div className="text-white text-center py-8">You need to login to view notifications.</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-4 text-white">
            <h2 className="text-2xl font-bold mb-4">Notifications</h2>

            {loading ? (
                <div className="text-gray-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
                <div className="text-gray-400">No notifications yet.</div>
            ) : (
                <div className="space-y-4">
                    {notifications.slice(0, 15).map((notif) => (
                        <div key={notif._id} className="flex flex-col space-y-2 bg-gray-900 p-3 rounded-lg">
                            <div className="flex items-center">
                                <Avatar className="w-10 h-10 mr-3 text-black">
                                    <AvatarImage src={notif.sender?.profilePicture} alt={notif.sender?.username} />
                                    <AvatarFallback>
                                        {(() => {
                                            const names = notif.sender?.username?.trim().split(" ");
                                            const first = names[0]?.[0]?.toUpperCase() || "";
                                            const second = names[1]?.[0]?.toUpperCase() || "";
                                            return first + second;
                                        })()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <Link to={`/profile/${notif.sender?._id}`} className="font-medium hover:underline text-blue-500">
                                        {notif.sender?.username}
                                    </Link>{" : "}
                                    {notif.message}
                                    <div className="text-xs text-gray-500 mt-1">
                                        {new Date(notif.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
