import { useState, useEffect } from "react";
import axios from "axios";
import Post from "@/components/Post";
import { X } from "lucide-react";

const SavedPost = ({ userId }) => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [activePost, setActivePost] = useState(null);
  const url = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      try {
        const res = await axios.get(`${url}/api/v1/user/bookmarks/${userId}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setBookmarkedPosts(res.data.bookmarkedPosts);
        } else {
          console.error("Failed to fetch bookmarks:", res.data.message);
        }
      } catch (err) {
        console.error("Error fetching bookmarks:", err.message);
      }
    };

    if (userId) {
      fetchBookmarkedPosts();
    }
  }, [userId]);

  if (!bookmarkedPosts.length) {
    return (
      <div className="text-gray-400 text-center p-4">
        No saved posts to display.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
        {bookmarkedPosts.map((post) => (
          <div
            key={post._id}
            onClick={() => setActivePost(post)}
            className="group block overflow-hidden rounded-xl cursor-pointer relative"
          >
            <div className="relative sm:pb-[133.333%] aspect-square">
              <img
                src={post.image}
                alt={post.caption || "Bookmarked post image"}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center opacity-0 group-hover:opacity-100 transition">
                <span className="text-white text-lg font-semibold">
                  <p className="ml-21">Likes: ❤️{post.likes.length}</p>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
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

export default SavedPost;
