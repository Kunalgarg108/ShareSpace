import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import EmojiPicker from "emoji-picker-react";
import { Smile } from "lucide-react"; // for the smile icon
import { checkAbusiveContent } from '@/lib/utils';
import 'react-toastify/dist/ReactToastify.css'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '@/redux/authSlice';
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { setPosts } from '@/redux/postSlice';
import { Loader2 } from "lucide-react";

function CreatePost() {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const postUser = useSelector(selectUser);
    const [showPicker, setShowPicker] = useState(false);
    const [content, setContent] = useState('')
    const [image, setImage] = useState('')
    const [open, setOpen] = useState(true)
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const posts = useSelector((state) => state.post.posts);

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

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true);
        const formData = new FormData()
        if (!content && !image) {
            toast.error('Please add content or an image to your post')
            return;
        } if (content) {
            formData.append('caption', content)
        }
        if (image) {
            formData.append('image', image)
        }
        if (!await checkContent(content)) {
            setLoading(false);
            return;
        }
        try {
            const res = await axios.post(`${url}/api/v1/post/addpost`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            })
            if (res.data.success) {
                console.log(res.data.post)
                dispatch(setPosts([...posts, res.data.post])) // add new post to existing posts
                console.log(posts)
                toast.success('Post created successfully!')
                setContent('')
                setImage(null)
                setOpen(false) // close dialog after post if you want
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create post')
        }
        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sw-full max-w-2xl h-[60vh] bg-white text-black flex flex-col justify-between">
                {postUser && (
                    <div className="flex items-center gap-3 border-b border-gray-300 pb-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300">
                            <Avatar className="w-full h-full rounded-full">
                                <AvatarImage src={postUser.avatar} alt={postUser?.username} className="object-cover w-full h-full" />
                                <AvatarFallback className="text-gray-700 text-sm font-semibold flex items-center justify-center h-full uppercase">
                                    {(() => {
                                        const names = postUser?.username?.trim().split(" ");
                                        const first = names[0]?.[0]?.toUpperCase() || "";
                                        const second = names[1]?.[0]?.toUpperCase() || "";
                                        return first + second;
                                    })()}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <span className="font-semibold text-lg text-gray-900">{postUser.username}</span>
                    </div>
                )}
                <DialogHeader>
                    <DialogTitle>Create Post</DialogTitle>
                    <DialogDescription>Share your thoughts or a photo</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4 relative">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="text-black bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg p-3 h-32 resize-none"
                    />

                    {/* Emoji picker toggle button */}

                    <button
                        type="button"
                        onClick={() => setShowPicker((prev) => !prev)}
                        className="right-4 top-[12.5rem]" // position button at bottom-right of textarea
                    >
                        <Smile className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </button>
                    {/* Emoji picker */}
                    {showPicker && (
                        <div className="absolute z-50 top-[15rem] right-4">
                            <EmojiPicker
                                onEmojiClick={(emojiData) => {
                                    setContent((prev) => prev + emojiData.emoji);
                                }}
                                theme="light"
                            />
                        </div>
                    )}

                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="cursor-pointer"
                    />

                    <DialogFooter>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                            <Button type="submit" variant="default">
                                Post
                            </Button>
                        }
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default CreatePost
