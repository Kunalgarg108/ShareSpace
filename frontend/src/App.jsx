import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Login from "./components/Login";
import SearchBox from "./components/SearchBox";
import UserPost from "./components/UserPost";
import SavedPost from "./components/SavedPost";
import Followers from "./components/Followers";
import Following from "./components/Following";
import CreatePost from "./components/CreatePost";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./redux/authSlice";
import Notifications from "./components/Notifications";
import EditProfile from "./components/EditProfile";
import ChatPage from "./components/ChatPage";
import Reel from "./components/Reel";
import { io } from "socket.io-client";
import { setSocket } from "./redux/socketSlice";
import { setOnlineUsers } from "./redux/chatSlice";
import Explore from "./components/Explore";
function App() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { socket } = useSelector((state) => state.socketio);
  const handleLoginSuccess = () => {
    toast.success("Logged in successfully!");
  };
  useEffect(() => {
    if (user) {
      const socketio = io(import.meta.env.VITE_API_URL, {
        query: { userId: user._id },
        transports: ["websocket"],
        withCredentials: true,
      });
      dispatch(setSocket(socketio));
      socketio.on("connect", () => {
        console.log("Connected to socket server");
      });
      socketio.on("disconnect", () => {
        console.log("Disconnected from socket server");
      });
      socketio.on("getOnlineUsers", (onlineUsers) => {
        console.log("Online Users:", onlineUsers);
        dispatch(setOnlineUsers(onlineUsers));
      });
      return () => {
        socketio.close();
        dispatch(setSocket(null));
      };
    }
    else if (socket) {
      socket.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/login";
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            user ? (
              <MainApp onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </>
  );
}

function MainApp({ onLogout }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      <div className="w-full sticky top-0 z-50 bg-black">
        <Navbar onLogout={onLogout} />
      </div>
      <div className="flex h-[calc(100vh-64px)] gap-x-0.5 overflow-hidden">
        <div className="w-full md:w-3/4 overflow-y-auto p-3 bg-black">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/userposts/:id" element={<UserPost />} />
            <Route path="/editprofile" element={<EditProfile />} />
            <Route path="/savedpost/:id" element={<SavedPost />} />
            <Route path="/followers/:id" element={<Followers />} />
            <Route path="/following/:id" element={<Following />} />
            <Route path="/createpost" element={<CreatePost />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/search" element={<SearchBox />} />
            <Route path="/reel" element={<Reel />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        <div className="hidden md:block w-full sm:w-1/4 p-4 bg-black overflow-y-auto">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}

export default App;
