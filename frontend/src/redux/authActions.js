import axios from "axios";
import { setSuggestedUsers } from "@/redux/authSlice";
import { toast } from "react-toastify";

export const getUserSuggestions = () => async (dispatch) => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:3000";
  try {
    const res = await axios.get(`${url}/api/v1/user/suggested`, {
      withCredentials: true,
    });

    if (res.data.success) {
      dispatch(setSuggestedUsers(res.data.finalUsers));
    } else {
      toast.error("Failed to fetch suggestions");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to fetch suggestions");
  }
};
