import { useState, useEffect } from "react";
import axios from "axios";
import Post from "@/components/Post";
import { X } from "lucide-react";

const UserPost = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [activePost, setActivePost] = useState(null);
  const url = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${url}/api/v1/post/user/${userId}/posts`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setPosts(res.data.posts);
        } else {
          console.error("Failed to fetch posts:", res.data.message);
        }
      } catch (err) {
        console.error("Error fetching posts:", err.message);
      }
    };

    if (userId) {
      fetchPosts();
    }
  }, [userId, posts.length, activePost]);

  if (!posts.length) {
    return (
      <div className="text-gray-400 text-center p-4">No posts to display.</div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
        {posts.map((post) => (
          <div
            key={post._id}
            onClick={() => setActivePost(post)}
            className="group block overflow-hidden rounded-xl cursor-pointer relative"
          >
            <div className="relative sm:pb-[133.333%] aspect-square">
              <img
                src={post.image}
                alt={post.caption || "User post image"}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              {/* Likes overlay on hover */}
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <span className="text-white text-lg font-semibold">
                  ❤️ {post.likes.length} Likes
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Fullscreen Modal */}
      {activePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <button
            onClick={() => setActivePost(null)}
            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/20 transition"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
            <div className="max-w-4xl w-full">
              <Post post={activePost} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserPost;
