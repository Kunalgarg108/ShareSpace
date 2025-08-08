import { useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useDispatch } from "react-redux";
import { setUserProfile } from "@/redux/authSlice";

const useFetchUserProfile = (userId) => {
  const dispatch = useDispatch();
  const url = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get(`${url}/api/v1/user/${userId}/profile`, {
          withCredentials: true,
        });

        if (response.data.success) {
          dispatch(setUserProfile(response.data.user));
        } else {
          console.error("Failed to fetch user profile:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [userId, dispatch]);
};

export default useFetchUserProfile;
