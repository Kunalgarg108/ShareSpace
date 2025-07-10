import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserSuggestions } from "@/redux/authActions";
import SuggestedUserCard from "./SuggestedUserCard";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const suggestedUsers = useSelector((state) => state.auth.suggestedUsers);
  const currentUser = useSelector((state) => state.auth.user); // ✅ get current user

  useEffect(() => {
    // if (!currentUser) {
    //   navigate("/login");
    //   return;
    // }
    dispatch(getUserSuggestions());
  }, [ dispatch]);

  return (
    <div className="space-y-2 p-4 bg-black border border-gray-800 rounded text-white">
      <h2 className="text-lg font-semibold">Suggested for you</h2>
      {suggestedUsers.length > 0 ? (
        suggestedUsers
          .filter((user) => user._id !== currentUser._id) // ✅ exclude self
          .map((user) => (
            <SuggestedUserCard key={user._id} user={user} />
          ))
      ) : (
        <div className="text-gray-500 text-sm">No suggestions available.</div>
      )}
    </div>
  );
}

export default Sidebar;
