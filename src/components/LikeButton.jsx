import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { supabase } from "../supabse-client";
import { useAuth } from "../context/AuthContext";

const vote = async (voteValue, postId, userId) => {
  // find weather vote is present or not
  const { data: existingVote } = await supabase
    .from("like_dislike")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingVote) {
    if (existingVote.vote === voteValue) {
      const { error } = await supabase
        .from("like_dislike")
        .delete()
        .eq("id", existingVote.id);
    } else {
      const { error } = await supabase
        .from("like_dislike")
        .update({ vote: voteValue })
        .eq("id", existingVote.id);
    }
    if (error) throw Error(error.message);
  } else {
    const { error } = await supabase
      .from("like_dislike")
      .insert({ post_id: postId, user_id: userId, vote: voteValue });
    if (error) throw new Error(error.message);
  }
};

const fetchAllVotes = async (postId) => {
  const { data, error } = await supabase
    .from("like_dislike")
    .select("*")
    .eq("post_id", postId);
  if (error) throw new Error(error.message);
  return data;
};

const LikeButton = ({ postId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // fetching data from supabase
  const {
    data: allVotes,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["vote", postId],
    queryFn: () => fetchAllVotes(postId),
    // refetchInterval: 3000,
  });

  // insertng data into database
  const { mutate } = useMutation({
    mutationFn: (voteValue) => {
      if (!user) throw new Error("you must be logged to vote");
      return vote(voteValue, postId, user?.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vote", postId] });
    },
  });

  if (isLoading) {
    return <div> Loading votes...</div>;
  }

  if (error) {
    return <div> Error: {error.message}</div>;
  }
  // console.log("existing vote", allVotes);
  const likes = allVotes?.filter((vote) => vote.vote === 1).length || 0;
  const dislikes = allVotes?.filter((vote) => vote.vote === -1).length || 0;
  const userVote = allVotes?.find((vote) => vote.user_id === user?.id)?.vote;

  return (
    <div className="flex items-center space-x-4 my-4">
      <button
        onClick={() => mutate(1)}
        className={`px-3 py-1 cursor-pointer rounded transition-colors duration-150 ${
          userVote === 1 ? "bg-green-500 text-white" : "bg-gray-200 text-black"
        }`}
      >
        👍 {likes}
      </button>
      <button
        onClick={() => mutate(-1)}
        className={`px-3 py-1 cursor-pointer rounded transition-colors duration-150 ${
          userVote === -1 ? "bg-red-500 text-white" : "bg-gray-200 text-black"
        }`}
      >
        👎 {dislikes}
      </button>
    </div>
  );
};

export default LikeButton;
