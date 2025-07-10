import { useEffect } from "react"
import axios from "axios";
import { useDispatch } from "react-redux";
import { setPosts } from "@/redux/postSlice";
const useGetAllPost = () =>{
    const dispatch = useDispatch();
    useEffect(() => {
        const url = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${url}/api/v1/post/all`, {
                    withCredentials: true,
                });
                if (response.data.success) {
                    dispatch(setPosts(response.data.posts));
                } else {
                    console.error('Failed to fetch posts:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };
        fetchPosts();
    }, []);
}

export default useGetAllPost;