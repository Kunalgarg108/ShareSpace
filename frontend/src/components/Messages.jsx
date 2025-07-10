import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useGetAllMessage from '@/hooks/useGetAllMessage'
import useGetRTM from '@/hooks/useGetRTM'

const Messages = ({ selectedUser }) => {
    useGetRTM();
    useGetAllMessage();

    const { messages } = useSelector(store => store.chat);
    const { user } = useSelector(store => store.auth);

    return (
        <div className='overflow-y-auto flex-1 p-4 space-y-4'>

            {/* Profile Header */}
            <div className='flex justify-center'>
                <div className='flex flex-col items-center justify-center gap-1'>
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                        <AvatarFallback className="text-black">
                            {(() => {
                                const names = selectedUser?.username?.trim().split(" ");
                                const first = names[0]?.[0]?.toUpperCase() || "";
                                const second = names[1]?.[0]?.toUpperCase() || "";
                                return first + second;
                            })()}
                        </AvatarFallback>
                    </Avatar>
                    <span>{selectedUser?.username}</span>
                    <Link to={`/profile/${selectedUser?._id}`}>
                        <Button className="h-8 my-2" variant="secondary">View profile</Button>
                    </Link>
                </div>
            </div>

            {/* Messages */}
            <div className='flex flex-col gap-3'>
                {
                    messages && messages.map((msg) => {
                        const isMine = msg.sender._id === user?._id;
                        const timeString = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                            <div
                                key={msg._id}
                                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`p-2 rounded-lg max-w-xs break-words relative ${isMine ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                                    <div>{msg.text}</div>
                                    <div className="text-xs text-gray-200 mt-1 text-right">{timeString}</div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>

        </div>
    )
}

export default Messages;
