import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

export default function Following() {
  const { id: userId } = useParams();
  const [following, setFollowing] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const url = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await axios.get(`${url}/api/v1/user/following/${userId}`, {
          withCredentials: true,
        });
        setFollowing(res.data.following);
      } catch (err) {
        console.error("Failed to fetch following list:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [userId]);

  const filteredFollowing = following.filter(
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
          placeholder="Search following"
          className="outline-none flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="w-5 h-5 text-gray-300 mr-2" />
      </div>

      {/* Results */}
      <div className="space-y-4 overflow-y-auto max-h-[500px]">
        {loading ? (
          <p className="text-center text-gray-500">Loading following...</p>
        ) : filteredFollowing.length > 0 ? (
          filteredFollowing.map((user) => (
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
                    <AvatarFallback className="flex items-center justify-center w-full h-full text-center bg-gray-200 text-black font-medium">
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
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No following found.</p>
        )}
      </div>
    </div>
  );
}
