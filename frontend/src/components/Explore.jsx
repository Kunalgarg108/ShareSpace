import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import Post from "@/components/Post";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function Explore() {
    const [posts, setPosts] = useState([]);
    const [activeIndex, setActiveIndex] = useState(null);
    const [loading, setLoading] = useState(true);

    const url = import.meta.env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axiosInstance.get(`${url}/api/v1/post/all`, { withCredentials: true });
                setPosts(res.data.posts);
            } catch (err) {
                console.error("Failed to fetch posts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const closeModal = () => setActiveIndex(null);
    const nextPost = () => setActiveIndex((prev) => (prev + 1) % posts.length);
    const prevPost = () => setActiveIndex((prev) => (prev - 1 + posts.length) % posts.length);

    return (
        <div className="p-4 mx-auto">
            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <Loader2 className="animate-spin w-20 h-20 text-gray-500" />
                </div>
            ) : posts.length === 0 ? (
                <p className="text-gray-500 text-center">No posts found.</p>
            ) : (
                <div className="w-full flex flex-wrap gap-4 sm:grid sm:grid-cols-3">
                    {posts.map((post, index) => (
                        <div
                            key={post._id}
                            className="w-full sm:w-auto cursor-pointer group overflow-hidden relative"
                            onClick={() => setActiveIndex(index)}
                        >
                            <img
                                src={post.image}
                                alt={post.caption}
                                className="w-full h-72 object-cover group-hover:scale-105 transition"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Carousel Modal */}
            {activeIndex !== null && (
                <Dialog open={activeIndex !== null} onOpenChange={closeModal}>
                    <DialogContent className="p-0 bg-transparent border-none shadow-none w-auto max-w-none">
                        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
                            <button
                                onClick={closeModal}
                                className="absolute top-70 text-white p-2 text-2xl rounded-full hover:bg-white/20 transition"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex items-center">
                                <button
                                    onClick={prevPost}
                                    className="text-white p-2 rounded-full hover:bg-white/20 transition"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>

                                <div className="w-[70vw] max-w-[1000px] bg-white rounded-lg overflow-hidden shadow">
                                    <Post post={posts[activeIndex]} />
                                </div>

                                <button
                                    onClick={nextPost}
                                    className="text-white p-2 rounded-full hover:bg-white/20 transition"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
