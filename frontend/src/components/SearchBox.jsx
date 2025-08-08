import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);

  const url = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get(`${url}/api/v1/user/getallusers`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setUsers(res.data.users);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  const handleClear = () => {
    setQuery("");
  };

  // Filter users based on query
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative text-white space-y-4 mx-4 sm:mx-40">
      {/* Search Bar */}
      <div className="flex items-center bg-neutral-900 rounded-lg px-3 py-2">
        <Search className="w-4 h-4 mr-2 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent focus:outline-none text-sm placeholder-gray-500 w-[90%]"
        />
        {query && (
          <button
            onClick={handleClear}
            className="ml-2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User List */}
      <div className="space-y-2 min-h-[max(200px,_83vh)] overflow-y-auto border border-gray-800 rounded-lg p-3 bg-neutral-900">
        {filteredUsers.length === 0 ? (
          <p className="text-gray-400 text-sm">No users found.</p>
        ) : (
          filteredUsers.map((user) => (
            <Link
              to={`/profile/${user._id}`}
              key={user._id}
              className="flex items-center gap-3 p-2 hover:bg-neutral-800 rounded transition"
            >
              <Avatar className="w-8 h-8 text-black">
                {user.profilePicture ? (
                  <AvatarImage src={user.profilePicture} />
                ) : (
                  <AvatarFallback>
                    {(() => {
                      const names = user.username.trim().split(" ");
                      const first = names[0]?.[0]?.toUpperCase() || "";
                      const second = names[1]?.[0]?.toUpperCase() || "";
                      return first + second;
                    })()}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-sm font-medium">{user.username}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
