import { Link, useParams } from "react-router-dom";
import { Plus, Image } from "lucide-react";
import { FaFileSignature } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setAuthUser, setUserProfile } from "@/redux/authSlice";
import UserPost from "./UserPost";
import SavedPost from "./SavedPost";
import { toast } from "react-toastify";
import axios from "axios";
import { persistor } from "@/redux/store";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const userId = useParams().id;
  useGetUserProfile(userId);
  const { user, userProfile } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const fileInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const url = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);

  if (!userProfile) {
    return <div className="text-center p-6">No profile data found.</div>;
  }

  const handleImageUpload = async (e) => {
    setLoading(true);
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);
    try {
      const res = await axios.put(`${url}/api/v1/user/profile/edit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success("Profile picture updated!");
        dispatch(setUserProfile(res.data.user));
        dispatch(setAuthUser(res.data.user));
        await persistor.flush();
      } else {
        toast.error(res.data.message || "Failed to update profile picture.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile picture.");
    }
    setLoading(false);
    fileInputRef.current.value = "";
  };
  const handleFollowOrUnfollow = async () => {
    try {
      const res = await axios.put(
        `${url}/api/v1/user/followorunfollow/${userProfile._id}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(isFollowing ? "Unfollowed user" : "Followed user successfully");
        setIsFollowing(!isFollowing);
        dispatch(setAuthUser(res.data.user)); // update logged-in user data
      }
      else {
        toast.error(res.data.message || "Failed to update follow status");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update follow status");
    }
  }
  useEffect(() => {
    if (user && user.following?.includes(userProfile._id)) {
      setIsFollowing(true);
    } else {
      setIsFollowing(false);
    }
  }, [user, userProfile._id]);
  useEffect(() => {
    setActiveTab("posts");
  }, [userProfile._id]);


  return (
    <>
      <header className="bg-gray-950 text-white p-4 flex flex-col gap-6 px-10">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="relative">
            <img
              src={`${userProfile.profilePicture}`}
              alt="Profile"
              className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-full border-4 border-gray-700"
            />
            {user && userProfile && userProfile._id === user._id && (loading ? (
              <Loader2 className="absolute bottom-8 right-14 w-6 h-6 text-white animate-spin" />
            ) : (
              <button
                title="Change profile photo"
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-8 right-14 p-1 bg-black rounded-full border border-gray-600"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            ))}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="w-full md:w-[70%] flex flex-col md:pl-12 gap-2">
            <h2 className="text-4xl md:text-5xl font-semibold">{userProfile.username}</h2>
            {userProfile._id === user?._id ? (
              <div className="flex gap-4 mt-2 text-lg md:text-xl mx-0.5">
                <Link to="/editprofile" className="hover:underline">Edit Profile</Link>
                <Link to="/archive/stories" className="hover:underline">View Archive</Link>
              </div>
            ) : (
              <div className="flex gap-4 mt-2 text-lg md:text-xl">
                <button
                  onClick={handleFollowOrUnfollow}
                  className={`px-3 mx-0.5 py-0.5 rounded border ${isFollowing
                    ? "border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white"
                    : "border-blue-500 text-blue-500 hover:bg-blue-900"
                    } transition`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <Link
                  to="/chat"
                  state={{ selectedUser: userProfile }}  // pass user via Link state
                  className="px-3 py-1 rounded border border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white transition duration-200"
                >
                  Message
                </Link>
              </div>
            )}
            <ul className="flex gap-6 md:gap-8 text-sm mt-2">
              <li>
                <span className="font-semibold">{userProfile.posts?.length || 0}</span> posts
              </li>
              <li>
                <Link to={`/followers/${userProfile._id}`} className="hover:underline">
                  <span className="font-semibold">{userProfile.followers?.length || 0}</span> followers
                </Link>
              </li>
              <li>
                <Link to={`/following/${userProfile._id}`} className="hover:underline">
                  <span className="font-semibold">{userProfile.following?.length || 0}</span> following
                </Link>
              </li>
            </ul>

            <p className="mt-4 text-gray-300 text-base">{userProfile.bio || "No bio added yet."}</p>
          </div>
        </div>
      </header>

      <main>
        <div className="flex space-x-6 justify-center py-4">
          <div
            onClick={() => setActiveTab("posts")}
            className={`p-3 rounded-full cursor-pointer transition ${activeTab === "posts" ? "bg-gray-100" : "hover:bg-gray-100"}`}
          >
            {/* <Image className="w-6 h-6 text-gray-400 hover:" /> */}
            <div className="relative group inline-block">
              {/* Icon */}
              <Image className="w-8 h-8 text-gray-400 cursor-pointer" />

              {/* Hover text */}
              <div className="absolute top-10 left-1 w-fit px-2 py-0.5 text-white bg-black/70 backdrop-blur-sm rounded whitespace-nowrap hidden group-hover:block z-50">
                User Post
              </div>
            </div>

          </div>
          {userProfile._id === user?._id && (
            <div
              onClick={() => setActiveTab("savedpost")}
              className={`p-3 rounded-full cursor-pointer transition ${activeTab === "savedpost" ? "bg-gray-100" : "hover:bg-gray-100"}`}
            >
              <div className="relative group inline-block">
                {/* Icon */}
                <FaFileSignature className="w-8 h-8 text-gray-400 cursor-pointer" />

                {/* Hover text */}
                <div className="absolute top-10 left-1 w-fit px-2 py-0.5 text-white bg-black/70 backdrop-blur-sm rounded whitespace-nowrap hidden group-hover:block z-50">
                  Saved Post
                </div>
              </div>
            </div>

          )}
        </div>

        <div className="px-4">
          {activeTab === "posts" && <UserPost userId={userProfile._id} />}
          {activeTab === "savedpost" && <SavedPost userId={userProfile._id} />}
        </div>
      </main>
    </>
  );
}
