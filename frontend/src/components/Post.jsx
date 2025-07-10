import { useEffect, useState } from "react";
import { checkAbusiveContent } from '@/lib/utils';
import EmojiPicker from "emoji-picker-react";
import {
  MessageCircle, Send, Bookmark, Smile, MoreVertical
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogTrigger
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import AllCommentsPost from "./AllCommentsPost";
import { useSelector, useDispatch } from "react-redux";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { toast } from "react-toastify";
import { setPosts } from "@/redux/postSlice";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { getUserSuggestions } from "@/redux/authActions";
import { setAuthUser } from "@/redux/authSlice";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Post({ post }) {
  if (!post || !post.author) {
    return null;
  }
  const [isFollowing, setIsFollowing] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const [liked, setLiked] = useState(false);

  // const [bookmark, setBookmark] = useState(false);
  const isBookmarked = user?.bookmarks?.includes(post._id);

  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [text, setText] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption);
  const [editImage, setEditImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.post.posts);
  const url = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const onEmojiClick = (emojiData) => setText((prev) => prev + emojiData.emoji);
  const HandleTextChange = (e) => setText(e.target.value.trimStart());
  const timeAgo = new Date(post.createdAt).toLocaleDateString();

  const handleDeletePost = async () => {
    try {
      const res = await axios.delete(`${url}/api/v1/post/delete/${post?._id}`, { withCredentials: true });
      if (res.data.success) {
        toast.success("Post deleted successfully");
        const updatedPosts = posts.filter((p) => p._id !== post?._id);
        dispatch(setPosts(updatedPosts));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete post");
    }
  };

  const handleEditPostSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("caption", editCaption);
    if (editImage) formData.append("image", editImage);

    try {
      const res = await axios.post(`${url}/api/v1/post/addpost`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success("Post updated successfully!");
        const updatedPosts = posts.map((p) =>
          p._id === post._id ? res.data.post : p
        );
        dispatch(setPosts(updatedPosts));
        setEditOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update post");
    }
  };

  const likeOrUnlikePostHandler = async () => {
    try {
      const res = await axios.post(`${url}/api/v1/post/${post._id}/like`, {}, { withCredentials: true });
      if (res.data.success) {
        setLikesCount(res.data.likes.length);
        setLiked(res.data.isLiked);
        const updatedPosts = posts.map((p) =>
          p._id === post._id ? { ...p, likes: res.data.likes } : p
        );
        dispatch(setPosts(updatedPosts));
        const updatedUser = {
          ...user,
          likedPosts: res.data.isLiked
            ? [...(user.likedPosts || []), post._id]
            : (user.likedPosts || []).filter((id) => id !== post._id),
        };
        dispatch(setAuthUser(updatedUser));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to like/unlike post");
    }
  };
  const handleBookmark = async () => {
    try {
      const res = await axios.put(
        `${url}/api/v1/post/${post._id}/bookmark`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        // setBookmark(res.data.isBookmarked);
        toast.success(res.data.message);

        // Update posts manually here
        const updatedPosts = posts.map((p) =>
          p._id === post._id ? { ...p, isBookmarked: res.data.isBookmarked } : p
        );
        dispatch(setPosts(updatedPosts));
        const updatedUser = {
          ...user,
          bookmarks: res.data.isBookmarked
            ? [...user.bookmarks, post._id]
            : user.bookmarks.filter((id) => id !== post._id),
        };
        dispatch(setAuthUser(updatedUser));
      } else {
        toast.error(res.data.message || "Failed to update bookmark");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update bookmark");
    }
  };

  const CommentHandler = async () => {
    if (text.trim() === "") return;
    setLoading(true);
    if (!await checkContent(text)) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post(
        `${url}/api/v1/post/${post._id}/comment`,
        { text },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Comment posted!");
        const updatedPosts = posts.map((p) =>
          p._id === post._id ? { ...p, comments: [...p.comments, res.data.comment] } : p
        );
        dispatch(setPosts(updatedPosts));
        setText("");
        setShowPicker(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post comment");
    }
    setLoading(false);
  };
  const handleFollowOrUnfollow = async () => {
    try {
      const res = await axios.put(
        `${url}/api/v1/user/followorunfollow/${post.author._id}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(isFollowing ? "Unfollowed user" : "Followed user successfully");
        setIsFollowing(!isFollowing);
        dispatch(getUserSuggestions());
        dispatch(setAuthUser(res.data.user)); // update logged-in user data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update follow status");
    }
  }
  const checkContent = async (text) => {
    try {
      const result = await checkAbusiveContent(text);
      if (result) {
        toast.error("Your post contains abusive content.");
        return false;
      }
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };
  useEffect(() => {
    if (user && user?.following?.includes(post.author._id)) {
      setIsFollowing(true);
    } else {
      setIsFollowing(false);
    }
    if (user && user?.likedPosts?.includes(post._id)) {
      setLiked(true);
    } else {
      setLiked(false);
    }
  }, [user, post]);


  return (
    <div className="bg-black flex items-center justify-center px-4">
      <Card className="bg-gray-950 border border-gray-900 text-white sm:w-[60%] w-[95%] overflow-hidden">
        {/* Header */}
        <CardContent className="flex items-center justify-between px-4 pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 text-black">
              {post.author?.profilePicture ? (
                <AvatarImage src={post.author.profilePicture} />
              ) : (
                 <AvatarFallback>
                    {(() => {
                      const names = post.author?.username?.trim().split(" ");
                      const first = names[0]?.[0]?.toUpperCase() || "";
                      const second = names[1]?.[0]?.toUpperCase() || "";
                      return first + second;
                    })()}
                  </AvatarFallback>
              )}
            </Avatar>
            <div className="flex items-center gap-2">
              <Link to={`/profile/${post.author._id}`} className="font-medium hover:underline">
                {post.author?.username}
              </Link>
              <span className="font-medium"></span>
              {user?._id === post.author._id ? (
                <Badge variant="secondary">Author</Badge>
              ) : (
                <button
                  onClick={handleFollowOrUnfollow}
                  className={`px-3 mx-3 py-0.5 rounded border ${isFollowing
                    ? "border-gray-600 text-gray-400 hover:bg-gray-800"
                    : "border-blue-500 text-blue-500 hover:bg-blue-900"
                    } transition`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400 sm:block hidden">{timeAgo}</div>
            {user?._id === post.author._id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-400 hover:text-white transition">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black text-white border-gray-700">
                  <DropdownMenuItem
                    onClick={() => setEditOpen(true)}
                    className="text-blue-400 cursor-pointer"
                  >
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeletePost}
                    className="text-red-500 cursor-pointer"
                  >
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
        <div className="w-full h-96 bg-gray-800 overflow-hidden">
          <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
        </div>
        <CardContent className="space-y-4 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              {
                liked
                  ? <FaHeart onClick={likeOrUnlikePostHandler} size={'24'} className='cursor-pointer text-red-600' />
                  : <FaRegHeart onClick={likeOrUnlikePostHandler} size={'22px'} className='cursor-pointer hover:text-gray-600' />
              }



              <Dialog>
                <DialogTrigger asChild>
                  <button><MessageCircle className="w-6 h-6 cursor-pointer" /></button>
                </DialogTrigger>
                <DialogContent className="bg-transparent border-gray-800 text-black max-w-2xl p-0">
                  <VisuallyHidden>
                    <DialogTitle>Comments</DialogTitle>
                  </VisuallyHidden>
                  <AllCommentsPost postId={post._id} postUser={{ username: post.author.username, avatar: post.author.profilePicture }} />
                </DialogContent>
              </Dialog>
              <button><Send className="w-6 h-6" /></button>
            </div>
            {/* <button onClick={handleBookmark} className="transition-colors duration-200">
              <Bookmark className={`w-6 h-6 ${bookmark ? "text-yellow-400 fill-yellow-400" : "text-white"}`} />
            </button> */}
            <button onClick={handleBookmark} className="transition-colors duration-200">
              <Bookmark className={`w-6 h-6 ${isBookmarked ? "text-yellow-400 fill-yellow-400" : "text-white"}`} />
            </button>

          </div>

          {/* Likes */}
          <div className="text-sm font-semibold">{likesCount} likes</div>
          {/* Caption */}
          {post.caption && <div><span className="font-bold">Caption:</span>
            <span className="ml-2">{post.caption}</span></div>}
          {/* View Comments Dialog */}
          {post.comments?.length > 0 ? (
            <Dialog>
              <DialogTrigger asChild>
                <button className="cursor-pointer hover:text-slate-300">View all {post.comments?.length} comments</button>
              </DialogTrigger>
              <DialogContent className="bg-transparent border-gray-800 text-black max-w-2xl p-0">
                <VisuallyHidden>
                  <DialogTitle>Comments</DialogTitle>
                  <DialogDescription>
                    View this user's comments.
                  </DialogDescription>
                </VisuallyHidden>
                <AllCommentsPost postId={post._id} postUser={{ username: post.author.username, avatar: post.author.profilePicture }} />
              </DialogContent>
            </Dialog>) : (<div className="text-sm text-gray-400 ">No One Comment Yet</div>)
          }
          {/* Add Comment */}
          <div className="flex items-center space-x-2 border-t border-gray-800 pt-3 relative">
            <button onClick={() => setShowPicker((prev) => !prev)}>
              <Smile className="w-5 h-5 text-gray-400 cursor-pointer" />
            </button>
            <input type="text" placeholder="Add a comment..." value={text} onChange={HandleTextChange} className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500" />
            {showPicker && (
              <div className="absolute bottom-12 left-0 z-50">
                <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
              </div>
            )}
            {text && (loading ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (
              <button onClick={CommentHandler} className="text-blue-500 font-semibold hover:opacity-80 transition disabled:opacity-50" disabled={!text.trim()}>
                Post
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-black text-white border-gray-800 max-w-lg space-y-4">
          <h2 className="text-lg font-semibold">Edit Post</h2>
          <form onSubmit={handleEditPostSubmit} className="space-y-3">
            <textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              className="w-full h-28 bg-gray-900 border border-gray-700 p-2 rounded text-white"
              placeholder="Edit your caption..."
            />
            {post.image && !editImage && (
              <img src={post.image} alt="Post" className="w-full h-48 object-cover rounded" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEditImage(e.target.files[0])}
              className="w-full text-sm"
            />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-1 border border-gray-500 rounded">Cancel</button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded">Update</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
