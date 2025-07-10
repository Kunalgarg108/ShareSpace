import { setMessages } from "@/redux/chatSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllMessage = () => {
    const dispatch = useDispatch();
    const {selectedUser} = useSelector(store=>store.auth);
    const url = import.meta.env.VITE_API_URL || "http://localhost:3000";
    useEffect(() => {
        const fetchAllMessage = async () => {
            try {
                const res = await axios.get(`${url}/api/v1/message/all/${selectedUser?._id}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setMessages(res.data.messages));
                }
                console.log(res.data);
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllMessage();
    }, [selectedUser, dispatch]);
};
export default useGetAllMessage;