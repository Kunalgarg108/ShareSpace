import React, { useRef, useState } from "react";
import { Bell, Lock, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { FaEyeSlash, FaEnvelope, FaKey, FaQuestionCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { setAuthUser, setUserProfile } from "@/redux/authSlice";
import { toast } from "react-toastify";

function EditProfile() {
    const url = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const imageRef = useRef(null);
    const user = useSelector((state) => state.auth.user);
    const [bio, setBio] = useState(user?.bio || "");
    const [gender, setGender] = useState(user?.gender || "");
    const HandleEditProfile = async (e) => {
        e.preventDefault();
        if (!bio.trim()) {
            toast.error("Please enter your bio.");
            return;
        }
        if (!gender) {
            toast.error("Please select your gender.");
            return;
        }
        try {
            setLoading(true);
            const formData = new FormData();
            if (imageRef.current.files[0]) {
                formData.append("profilePicture", imageRef.current.files[0]);
            }
            if (bio !== user.bio) {
                formData.append("bio", bio);
            }
            if (gender !== user.gender) {
                formData.append("gender", gender);
            }        
            const res = await axiosInstance.put(`${url}/api/v1/user/profile/edit`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });

            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));      
                dispatch(setUserProfile(res.data.user));
                console.log("Profile updated");
                toast.success("Profile updated successfully!");
                navigate(`/profile/${user._id}`);
            }
        } catch (err) {
            toast.error("Error updating profile. Please try again.", err);
            console.error("Error updating profile:", err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-1/4 p-4 border-r min-h-screen bg-black text-white sm:block hidden">
                <h2 className="text-xl font-semibold mb-6">Settings</h2>

                <Link to="/notifications" className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gray-300">
                    <Bell className="w-6 h-6 text-gray-500" />
                    <span className="text-sm font-medium text-gray-500">Notifications</span>
                </Link>

                <Link to="/privacy" className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gray-300">
                    <Lock className="w-6 h-6 text-gray-500" />
                    <span className="text-sm font-medium text-gray-500">Account Privacy</span>
                </Link>

                <Link to="/close-friends" className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gray-300">
                    <Users className="w-6 h-6 text-gray-500" />
                    <span className="text-sm font-medium text-gray-500">Close Friends</span>
                </Link>

                <Link to="/security" className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gray-300">
                    <FaKey className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-500">Security</span>
                </Link>

                <Link to="/help" className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gray-300">
                    <FaQuestionCircle className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-500">Help</span>
                </Link>

                <Link to="/messages" className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gray-300">
                    <FaEnvelope className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-500">Messages</span>
                </Link>

                <Link to="/hide-story" className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gray-300">
                    <FaEyeSlash className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-500">Hide Story</span>
                </Link>
            </div>

            {/* Profile Details */}
            <div className="flex-1 p-6">
                <h1 className="text-2xl ml-2 mb-2.5">Edit Profile</h1>
                <Card className=" mx-auto  bg-black text-white">
                    <div className="flex flex-row">

                        <CardHeader>
                            {/* <CardTitle className="text-2xl font-bold">Profile Details</CardTitle> */}
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Avatar and Username */}
                            <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16 rounded-full overflow-hidden bg-yellow-50">
                                    {user?.profilePicture ? (
                                        <AvatarImage src={user.profilePicture} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <AvatarFallback>
                                            {user?.username?.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div>
                                    <h2 className="text-5xl font-bold">{user?.username}</h2>
                                    <p className="text-sm text-gray-400">{user?.email}</p>
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <h3 className=" font-medium text-gray-300 mb-1">Bio</h3>
                                <p className="text-base text-gray-300">{user?.bio || "No bio added."}</p>
                            </div>
                        </CardContent>
                        <input type='file' ref={imageRef} className="hidden" />
                        <button onClick={() => imageRef.current.click()} className="mt-15 ml-10 h-fit py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex justify-end">
                            Change Profile Photo
                        </button>
                    </div>
                </Card>
                <div className="mx-4">
                    <h4 className="text-slate-50 mt-4 text-xl">Bio</h4>
                    <textarea
                        className="mt-2 p-3 bg-gray-800 text-white rounded-lg w-full h-32 resize-none focus:ring-0 focus:ring-blue-500"
                        placeholder="Write your bio here..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />
                </div>
                <div className="mx-4 mt-4">
                    <h4 className="text-slate-50 text-xl">Gender</h4>
                    <div className="max-w-[150px] bg-white rounded-lg mt-3 text-black">
                        <select
                            className="w-full p-2 rounded-lg border border-gray-300 bg-white text-black"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <option value="" disabled>Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end mx-12 my-20">
                    {loading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-500" />
                    ) : (
                        <Button onClick={HandleEditProfile} className="mt-4 bg-blue-500 px-8 py-2">
                            Submit
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EditProfile;
