import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { getUserSuggestions } from "@/redux/authActions";
import { setAuthUser } from "@/redux/authSlice";
import { useSelector } from "react-redux";
import { DialogDescription } from "@radix-ui/react-dialog";

export default function AllCommentsPost({ postUser, postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const url = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const dispatch = useDispatch();
  const [followingMap, setFollowingMap] = useState({}); // map of userId -> true/false
  const { user } = useSelector((state) => state.auth);
  // Fetch comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`${url}/api/v1/post/${postId}/comment/all`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setComments(res.data.comments);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load comments");
      }
    };

    fetchComments();
  }, [postId, url]);
  useEffect(() => {
    if (!user) return;
    const map = {};
    comments.forEach((comment) => {
      map[comment.author._id] = user.following?.includes(comment.author._id) || false;
    });
    setFollowingMap(map);
  }, [comments, user]);

  // Delete comment handler
  const handleDeleteComment = async (commentId) => {
    toast.info("Deleting comment...");
    // try {
    //   const res = await axios.delete(`${url}/api/v1/comment/${commentId}`, {
    //     withCredentials: true,
    //   });
    //   if (res.data.success) {
    //     toast.success("Comment deleted");
    //     // Remove from UI state
    //     setComments((prev) => prev.filter((c) => c._id !== commentId));
    //     dispatch(setPosts((prev) =>
    //       prev.map((post) => {
    //         if (post._id === postId) {
    //           return {
    //             ...post,
    //             comments: post.comments.filter((c) => c._id !== commentId),
    //           };
    //         }
    //         return post;
    //       })
    //     ));
    //   }
    // } catch (error) {
    //   toast.error(error.response?.data?.message || "Failed to delete comment");
    // }
  };
  const handleFollowOrUnfollow = async (authorId) => {
    try {
      const res = await axios.put(
        `${url}/api/v1/user/followorunfollow/${authorId}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(
          followingMap[authorId] ? "Unfollowed user" : "Followed user successfully"
        );
        setFollowingMap((prev) => ({
          ...prev,
          [authorId]: !prev[authorId],
        }));
        dispatch(getUserSuggestions());
        dispatch(setAuthUser(res.data.user));
        console.log(followingMap);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update follow status");
    }
  };

  return (
    <div className="bg-transparent min-h-[50%] flex justify-center">
      <Card className="w-full max-w-xl border-gray-800 bg-white text-black">
        <CardContent className="space-y-4">
          {/* 📌 Post Owner Section */}
          <div className="flex items-center gap-3 border-b border-gray-300 pb-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={postUser?.avatar} alt={postUser.username} />
              <AvatarFallback>
                {(() => {
                  const names = postUser?.username?.trim().split(" ");
                  const first = names[0]?.[0]?.toUpperCase() || "";
                  const second = names[1]?.[0]?.toUpperCase() || "";
                  return first + second;
                })()}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-lg">{postUser.username}</span>
          </div>

          <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">Comments</h2>

          {comments.length === 0 ? (
            <div className="text-gray-500 text-center">No comments yet.</div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="flex items-center gap-1 cursor-pointer flex-col">
                        <Avatar className="w-10 h-10 rounded-full overflow-hidden">
                          {comment.author?.profilePicture ? (
                            <AvatarImage
                              src={comment.author.profilePicture}
                              alt={comment.author?.username}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <AvatarFallback className="flex items-center justify-center w-full h-full rounded-full bg-slate-200 text-black font-semibold ">
                              {(() => {
                                const names = comment.author?.username?.trim().split(" ") || [];
                                const first = names[0]?.[0]?.toUpperCase() || "";
                                const second = names.length > 1 ? names[1]?.[0]?.toUpperCase() : "";
                                return first + second;
                              })()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="font-semibold text-sm">{comment.author?.username}</span>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="bg-black border border-gray-800 text-white max-w-sm">
                      <DialogTitle>Comment Profile</DialogTitle>
                      <DialogDescription>
                        {/* View this user's profile and follow/unfollow them. */}
                      </DialogDescription>
                      <div className="flex flex-col items-center gap-4 p-4">
                        <Avatar className="w-20 h-20 rounded-full overflow-hidden">
                          {comment.author?.profilePicture ? (
                            <AvatarImage
                              src={comment.author.profilePicture}
                              alt={comment.author?.username}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <AvatarFallback className="flex items-center justify-center w-full h-full rounded-full bg-white text-black font-semibold text-2xl">
                              {(() => {
                                const names = comment.author?.username?.trim().split(" ") || [];
                                const first = names[0]?.[0]?.toUpperCase() || "";
                                const second = names.length > 1 ? names[1]?.[0]?.toUpperCase() : "";
                                return first + second;
                              })()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <h3 className="text-lg font-semibold">{comment.author?.username}</h3>
                        {user?._id !== comment.author._id && (
                          <button
                            onClick={() => handleFollowOrUnfollow(comment.author._id)}
                            className={`px-4 py-1 rounded-lg transition ${followingMap[comment.author._id]
                              ? "bg-gray-600 text-white hover:bg-gray-700"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                              }`}
                          >
                            {followingMap[comment.author._id] ? "Following" : "Follow"}
                          </button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Comment Text */}
                  <div>
                    <div>
                      <span className="ml-2">{comment.text}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 ml-4">
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* 3 Dot Menu */}
                {(currentUser?._id === comment.author?._id || currentUser?._id === postUser?._id) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded-full hover:bg-gray-200">
                        <EllipsisVertical className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white border border-gray-300">
                      <DropdownMenuItem
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-600 cursor-pointer"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
