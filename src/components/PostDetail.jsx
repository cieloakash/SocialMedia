import React from 'react'
import {useQuery} from '@tanstack/react-query'
import { supabase } from '../supabse-client'
import LikeButton from './LikeButton'

const fetchSinglePost = async (id)=>{
    const {data,error} = await supabase.from("posts").select("").eq("id",id).single()
    if (error) {
        throw new Error(error.message)
    }
    return data
}

const PostDetail = ({postId}) => {
    // useQuery takes function and keys that retrive data
    const {data,error,isLoading} = useQuery({
        // we can get individual version of post  queryKey:["post",postId],
        queryKey:["post",postId],
        queryFn:()=>fetchSinglePost(postId)
    })
    if(isLoading){
        return <div>Loading posts...</div>
    }
    if(error) return <div>Error: {error.message}</div>

    console.log(data);
    
  return (
    <div className="space-y-6">
    <h2 className="text-6xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
      {data?.title}
    </h2>
    {data?.imageurl && (
      <img
        src={data.imageurl}
        alt={data?.title}
        className="mt-4 rounded object-cover w-full h-64"
      />
    )}
    <p className="text-gray-400">{data?.content}</p>
    <p className="text-gray-500 text-sm">
      Posted on: {new Date(data.created_at).toLocaleDateString()}
    </p>
    <LikeButton postId={postId}/>
 
  </div>
  )
}

export default PostDetail