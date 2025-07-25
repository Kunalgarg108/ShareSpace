import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { toast } from "react-toastify";

export default function Followers() {
  const { id: userId } = useParams();
  const [followers, setFollowers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const currentUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const url = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await axios.get(`${url}/api/v1/user/followers/${userId}`, {
          withCredentials: true,
        });
        setFollowers(res.data.followers);
      } catch (err) {
        console.error("Failed to fetch followers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [userId]);

  const handleFollowToggle = async (targetId) => {
    setUpdatingId(targetId);
    try {
      const res = await axios.put(
        `${url}/api/v1/user/followorunfollow/${targetId}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        const isNowFollowing = res.data.user.following.includes(targetId);
        toast.success(isNowFollowing ? "Followed user" : "Unfollowed user");
        dispatch(setAuthUser(res.data.user));
      }
    } catch (err) {
      toast.error("Failed to update follow status");
    }
    setUpdatingId(null);
  };

  const filteredFollowers = followers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Search Input */}
      <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 mb-4">
        <input
          type="text"
          placeholder="Search followers"
          className="outline-none flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="w-5 h-5 text-gray-300 mr-2" />
      </div>

      {/* Results */}
      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        {loading ? (
          <p className="text-center text-gray-500">Loading followers...</p>
        ) : filteredFollowers.length > 0 ? (
          filteredFollowers.map((user) => {
            const isFollowing = currentUser?.following?.includes(user._id);
            return (
              <div
                key={user._id}
                className="flex items-center justify-between bg-white text-black rounded-lg shadow p-2"
              >
                <div className="flex items-center">
                  <Avatar className="w-12 h-12 mr-4 rounded-full overflow-hidden border border-gray-200">
                    {user.profilePicture ? (
                      <AvatarImage
                        src={user.profilePicture}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <AvatarFallback className="flex items-center justify-center w-full h-full text-center bg-gray-200">
                        {(() => {
                          const names = user.username?.trim().split(" ");
                          const first = names[0]?.[0]?.toUpperCase() || "";
                          const second = names[1]?.[0]?.toUpperCase() || "";
                          return first + second;
                        })()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.username}</p>
                    {user.name && (
                      <p className="text-gray-500 text-sm">{user.name}</p>
                    )}
                  </div>
                </div>

                {/* Follow/Following Button */}
                {user._id !== currentUser?._id && (
                  <button
                    onClick={() => handleFollowToggle(user._id)}
                    disabled={updatingId === user._id}
                    className={`text-sm font-semibold px-3 py-1 rounded border ${
                      isFollowing
                        ? "text-green-500 border-green-500"
                        : "text-blue-500 border-blue-500"
                    }`}
                  >
                    {updatingId === user._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isFollowing ? (
                      "Following"
                    ) : (
                      "Follow"
                    )}
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center">No followers found.</p>
        )}
      </div>
    </div>
  );
}
