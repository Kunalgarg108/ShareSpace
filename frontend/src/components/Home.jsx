import React from 'react'
import Post from './Post';
import useGetAllPost from '@/hooks/useGetAllPost';
import { useSelector } from 'react-redux';

function Home() {
  useGetAllPost();
  const {posts} = useSelector(store => store.post);
  return (
    <div>
      <div className="mt-6">
      </div>
      {posts.map(post => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  )
}

export default Home;
