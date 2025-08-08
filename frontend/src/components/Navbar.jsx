import React, { useEffect, useState } from "react";
import {
  Bell,
  CameraIcon,
  Home,
  MessageCircleReply,
  PlusSquare,
  Search,
  TrendingUp,
  LogOut,
  Menu,
  Mic
} from "lucide-react";
import VoiceControlDialog from "./ui/VioceControlDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useSelector } from "react-redux";
import axiosInstance from "@/utils/axiosInstance";

function Navbar({ onLogout }) {
  const url = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false);

  const sidebaritems = [
    { icon: <Home className="w-7 h-7" />, text: "Home" },
    { icon: <Search className="w-7 h-7" />, text: "Search" },
    { icon: <TrendingUp className="w-7 h-7" />, text: "Explore" },
    { icon: <CameraIcon className="w-7 h-7" />, text: "Reel" },
    { icon: <MessageCircleReply className="w-7 h-7" />, text: "Messages" },
    { icon: <Bell className="w-7 h-7" />, text: "Notifications" },
    { icon: <PlusSquare className="w-7 h-7" />, text: "Create" },
    {
      icon: (
        <Avatar className="w-7 h-7 rounded-full overflow-hidden">
          <AvatarImage
            src={user?.profilePicture}
            className="object-cover w-full h-full"
          />
          <AvatarFallback className="w-full h-full flex items-center justify-center rounded-full bg-white text-black text-sm">
            {(() => {
              const names = user.username?.trim().split(" ");
              const first = names[0]?.[0]?.toUpperCase() || "";
              const second = names[1]?.[0]?.toUpperCase() || "";
              return first + second;
            })()}
          </AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <Mic className="w-7 h-7" />, text: "Speak", onClick: () => setVoiceDialogOpen(true) },
    { icon: <LogOut className="w-7 h-7" />, text: "Logout", onClick: onLogout },
  ];

  const NavbarHandler = async (item) => {
    if (item.onClick) {
      item.onClick();
    } else {
      if (item.text === "Notifications") {
        try {
          await axiosInstance.put(`${url}/api/v1/notifications/markasread`, {}, { withCredentials: true });
          setUnreadCount(0);
        } catch (err) {
          console.error("Error marking notifications as read", err);
        }
        window.location.href = "/notifications";
      }
      else if (item.text === "Home") window.location.href = "/";
      else if (item.text === "Search") window.location.href = "/search";
      else if (item.text === "Explore") window.location.href = "/explore";
      else if (item.text === "Reel") window.location.href = "/reel";
      else if (item.text === "Messages") window.location.href = "/chat";
      else if (item.text === "Create") window.location.href = "/createpost";
      else if (item.text === "Profile") window.location.href = `/profile/${user?._id}`;
    }
  };

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await axiosInstance.get(`${url}/api/v1/notifications/unread/count`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setUnreadCount(res.data.count);
        }
      } catch (err) {
        console.error("Error fetching unread count", err);
      }
    };

    fetchUnreadCount();
  }, []);

  return (
    <div className="h-[60px] w-full bg-black flex items-center justify-between px-4 my-0.5">
      <VoiceControlDialog open={voiceDialogOpen} onOpenChange={setVoiceDialogOpen} />
      <div className="flex items-center gap-0">
        <img src="/logo2.png" alt="logo" className="w-10 h-10 m-0 p-0" />
        <p className="font-semibold text-red-400 text-xl m-0 p-0">ShareSpace</p>
      </div>

      <div className="hidden sm:flex items-center gap-x-22">
        {sidebaritems.map((item, index) => (
          <div
            key={index}
            onClick={() => NavbarHandler(item)}
            className="group flex items-center space-x-2 hover:bg-gray-700 rounded-md px-2 py-1 cursor-pointer transition-all"
          >
            {item.text === "Notifications" ? (
              <div className="relative">
                {item.icon}
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-[10px] text-white bg-red-500 px-1.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
            ) : (
              item.icon
            )}
            <span className="text-white text-sm hidden group-hover:inline">
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <Menu
          className="w-6 h-6 text-white cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        />
        {isOpen && (
          <div className="absolute right-4 top-[60px] bg-gray-800 rounded-md shadow-md p-2 flex flex-col gap-y-2 z-50">
            {sidebaritems.map((item, index) => (
              <div
                key={index}
                onClick={() => NavbarHandler(item)}
                className="flex items-center space-x-2 hover:bg-gray-700 rounded-md px-2 py-1 cursor-pointer"
              >
                {item.icon}
                <span className="text-white text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
