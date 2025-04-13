import React from 'react'
import {useQuery} from  '@tanstack/react-query'
import { supabase } from '../supabse-client'
import PostItem from './PostItem'

const fetchPosts = async()=>{
  const {data,error} = await supabase.from("posts").select("*").order('created_at',{ascending:false})
    if(error)throw new Error(error.message);
    return data
}

const PostList = () => {
    // fetch data from table
    // useQuery is use to get data unlike useMutation use for pushing data

    const {data,error,isLoading} = useQuery({queryKey:["posts"],queryFn:fetchPosts})
    if(isLoading)return <div>Loading Post...</div>
    if(error) return <div>Error: {error.message}</div>
    console.log(data);
    
  return (
    <div className="flex flex-wrap gap-6 justify-center">
    {data?.map((post, key) => (
      <PostItem post={post} key={key} />
    ))}
  </div>
  )
}

export default PostList