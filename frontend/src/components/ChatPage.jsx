import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setSelectedUser } from '@/redux/authSlice';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MessageCircleCode, Smile } from 'lucide-react';
import Messages from './Messages';
import axios from 'axios';
import { setMessages } from '@/redux/chatSlice';
import EmojiPicker from "emoji-picker-react";
import { checkAbusiveContent } from '@/lib/utils';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

const ChatPage = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [textMessage, setTextMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const { user, suggestedUsers, selectedUser } = useSelector(store => store.auth);
  const { onlineUsers = [], messages = [] } = useSelector(store => store.chat || {});
  const [recentChats, setRecentChats] = useState([]);
  const dispatch = useDispatch();
  const location = useLocation();

  const sendMessageHandler = async (receiverId) => {
    try {
      // Check for abusive content first
      const isValid = await checkAbusiveContent(textMessage);
      if (isValid) {
        toast.error("Your message contains abusive content.");
        return;
      }

      const res = await axios.post(`${url}/api/v1/message/send/${receiverId}`, { textMessage }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));
        setTextMessage("");
        setShowPicker(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
  if (location.state?.selectedUser) {
    dispatch(setMessages([]));
    dispatch(setSelectedUser(location.state.selectedUser));
  }
}, [location.state, dispatch]);


  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        const res = await axios.get(`${url}/api/v1/message/conversations`, { withCredentials: true });
        if (res.data.success) {
          setRecentChats(res.data.recentChats);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchRecentChats();
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, [dispatch]);

  const sortedUsers = [...suggestedUsers]
    .filter(su => su._id !== user._id)
    .sort((a, b) => {
      const aOnline = onlineUsers.includes(a._id);
      const bOnline = onlineUsers.includes(b._id);
      const aChatted = recentChats.find(u => u._id === a._id);
      const bChatted = recentChats.find(u => u._id === b._id);
      if (aOnline && aChatted && (!bOnline || !bChatted)) return -1;
      if (bOnline && bChatted && (!aOnline || !aChatted)) return 1;
      if (aOnline && !aChatted && (!bOnline || bChatted)) return -1;
      if (bOnline && !bChatted && (!aOnline || aChatted)) return 1;
      if (!aOnline && aChatted && (!bOnline || !bChatted)) return -1;
      if (!bOnline && bChatted && (!aOnline || !aChatted)) return 1;
      return 0;
    });

  return (
    <div className='flex h-[80vh]'>

      {/* User list */}
      <section className={`w-full md:w-1/4 my-8 mr-1 ${selectedUser ? 'hidden md:block' : 'block'}`}>
        <h1 className='font-bold mb-4 px-3 text-xl'>{user?.username}</h1>
        <hr className='mb-4 mr-1 border-gray-700' />
        <div className='overflow-y-auto h-[80vh]'>
          {
            sortedUsers.map((suggestedUser) => {
              const isOnline = onlineUsers.includes(suggestedUser?._id);
              return (
                <div
                  key={suggestedUser._id}
                  onClick={() => {
                    dispatch(setMessages([]));
                    dispatch(setSelectedUser(suggestedUser));
                  }}
                  className='flex gap-3 flex-wrap md:flex-nowrap items-center p-3 bg-white text-black mb-1 cursor-pointer hover:bg-gray-300 transition-all duration-200 ease-in-out'
                >
                  <Avatar className="w-14 h-14 text-black">
                    {suggestedUser?.profilePicture ? (
                      <AvatarImage src={suggestedUser.profilePicture} />
                    ) : (
                      <AvatarFallback>
                        {(() => {
                          const names = suggestedUser?.username?.trim().split(" ");
                          const first = names[0]?.[0]?.toUpperCase() || "";
                          const second = names[1]?.[0]?.toUpperCase() || "";
                          return first + second;
                        })()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className='flex flex-col'>
                    <span className='font-medium'>{suggestedUser?.username}</span>
                    <span className={`text-xs font-bold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                      {isOnline ? 'online' : 'offline'}
                    </span>
                  </div>
                </div>
              )
            })
          }
        </div>
      </section>

      {/* Chat area */}
      {
        selectedUser ? (
          <section className='flex-1 border-l border-l-gray-300 flex flex-col h-[90vh]'>
            <div className='flex gap-3 items-center text-black px-3 py-2 border-b border-gray-300 sticky top-0 bg-gray-1000 z-10'>
              <Avatar>
                <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                <AvatarFallback>
                  {(() => {
                    const names = selectedUser?.username?.trim().split(" ");
                    const first = names[0]?.[0]?.toUpperCase() || "";
                    const second = names[1]?.[0]?.toUpperCase() || "";
                    return first + second;
                  })()}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col text-white'>
                <span>{selectedUser?.username}</span>
              </div>
            </div>

            <Messages selectedUser={selectedUser} />

            {/* Message input + emoji picker */}
            <div className='relative flex items-center p-4 border-t border-t-gray-300'>
              <Input
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                type="text"
                className='flex-1 mr-2 focus-visible:ring-transparent'
                placeholder="Messages..."
              />

              <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="ml-2"
              >
                <Smile className="w-5 h-5 text-gray-300 hover:text-gray-500" />
              </button>

              <Button className='hover:bg-blue-500 bg-gray-600 ml-2' onClick={() => sendMessageHandler(selectedUser?._id)}>
                Send
              </Button>

              {showPicker && (
                <div className="absolute bottom-16 right-4 z-50">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setTextMessage((prev) => prev + emojiData.emoji);
                    }}
                    theme="light"
                  />
                </div>
              )}
            </div>

          </section>
        ) : (
          <div className='hidden md:flex flex-col items-center justify-center mx-auto'>
            <MessageCircleCode className='w-32 h-32 my-4' />
            <h1 className='font-medium'>Your messages</h1>
            <span>Send a message to start a chat.</span>
          </div>
        )
      }
    </div>
  )
}

export default ChatPage;
