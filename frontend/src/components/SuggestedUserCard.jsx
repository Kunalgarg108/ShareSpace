import { useDispatch, useSelector } from "react-redux";
import { getUserSuggestions } from "@/redux/authActions";
import axios from "axios";
import { toast } from "react-toastify";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { setAuthUser } from "@/redux/authSlice";
import { Loader2 } from "lucide-react";
function SuggestedUserCard({ user }) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user); // current logged-in user
  const [isFollowing, setIsFollowing] = useState(false);
  const url = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [loading , setLoading] =useState(false);
  useEffect(() => {
    // check if already following
    if (currentUser && currentUser.following?.includes(user._id)) {
      setIsFollowing(true);
    } else {
      setIsFollowing(false);
    }
  }, [currentUser, user._id]);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const res = await axios.put(
        `${url}/api/v1/user/followorunfollow/${user._id}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(isFollowing ? "Unfollowed user" : "Followed user successfully");
        setIsFollowing(!isFollowing);
        dispatch(getUserSuggestions());
        dispatch(setAuthUser(res.data.user)); // keep auth user updated
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update follow status");
    }
    setLoading(false);
  };
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="w-9 h-9 text-black">
          {user.profilePicture ? (
            <AvatarImage src={user.profilePicture} />
          ) : (
             <AvatarFallback>
                    {(() => {
                      const names = user?.username?.trim().split(" ");
                      const first = names[0]?.[0]?.toUpperCase() || "";
                      const second = names[1]?.[0]?.toUpperCase() || "";
                      return first + second;
                    })()}
                  </AvatarFallback>
          )}
        </Avatar>
        <Link to={`/profile/${user._id}`} className="font-medium hover:underline">
          {user.username}
        </Link>
      </div>
      { loading? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
      <button
        onClick={handleFollow}
        className={`text-sm font-semibold px-2 py-1 rounded ${isFollowing
            ? "text-green-500 border border-green-500"
            : "text-blue-500"
          }`}
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
}
    </div>
  );
}

export default SuggestedUserCard;
