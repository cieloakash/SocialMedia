import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "../supabse-client";
import CommentItem from "./CommentItem";

const createComment = async (newComment, postId, userId, author) => {
  if (!userId || !author) {
    throw new Error("Log in to comment");
  }
  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    content: newComment.content,
    parent_comment_id: newComment.parent_comment_id || null,
    user_id: userId,
    author: author,
  });

  if (error) throw new Error(error.message);
};

const fetchAllComments = async (postId) => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

const CommentSection = ({ postId }) => {
  const { user } = useAuth();

  const [newComment, setNewComment] = useState("");

  const {
    data: fetchedAllComments,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchAllComments(postId),
  });

  const { mutate, isError, isPending } = useMutation({
    mutationFn: (newComment) =>
      createComment(
        newComment,
        postId,
        user?.id,
        user?.user_metadata?.user_name
      ),
  });

  const singleCommentTree = (fetchedAllComments) => {
    const map = new Map();
    const root = [];
  
    fetchedAllComments.forEach((comment) => {
      map.set(comment.id, { ...comment, children: [] });
    });
  
    fetchedAllComments.forEach((comment) => {
      if (comment.parent_comment_id) {
        const parent = map.get(comment.parent_comment_id);
        if (parent) {
          parent.children.push(map.get(comment.id)); 
        }
      } else {
        root.push(map.get(comment.id));
      }
    });
  
    return root;
  };
  



  if (isLoading) {
    return <div> Loading votes...</div>;
  }

  if (error) {
    return <div> Error: {error.message}</div>;
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!newComment) return;
    mutate({ content: newComment, parent_comment_id: null });
    setNewComment("");
  };
  const commentTree = fetchedAllComments ? singleCommentTree(fetchedAllComments):[]

  return (
    <div className="mt-6">
      <h3 className="text-2xl font-semibold mb-4">Comments</h3>
      {/* comment post form */}
      {user ? (
        <form onSubmit={handleFormSubmit} className="mb-4">
          <textarea
            rows={3}
            placeholder="write comments"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full border border-white/10 bg-transparent p-2 rounded"
          />
          <button
            type="submit"
            disabled={!newComment}
            className="mt-2 bg-purple-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            {isPending ? "Pending..." : "Post Comments"}
          </button>
          {isError && (
            <p className="text-red-500 mt-2">Error posting comment.</p>
          )}
        </form>
      ) : (
        <p className="mb-4 text-gray-600">
          You must be logged in to post a comment.
        </p>
      )}
      {/* comment display  */}
      <div className="space-y-4">
        {commentTree.map((comment,key) => (
          <CommentItem key={key} comment={comment} postId={postId} />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
