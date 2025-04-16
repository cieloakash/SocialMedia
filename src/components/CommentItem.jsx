import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "../supabse-client";

const createReply = async ({
  replyContent,
  postId,
  parent_comment_id,
  userId,
  author,
}) => {
  console.log("createReply-props", replyContent);

  if (!userId || !author) throw new Error("login to reply");

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    content: replyContent,
    parent_comment_id: parent_comment_id,
    user_id: userId,
    author: author,
  });
  if (error) throw new Error(error.message);
};

const CommentItem = ({ comment, postId }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyComment, setRelyComment] = useState("");
  const [isClose, setIsClosed] = useState(false);
  const { user } = useAuth();

  const { mutate } = useMutation({
    mutationFn: ({ replyContent }) => {
      createReply({
        replyContent,
        postId,
        parent_comment_id: comment.id,
        userId: user?.id,
        author: user?.user_metadata?.user_name,
      });
    },
  });
  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyComment) return;
    mutate({ replyContent: replyComment });
    setRelyComment("");
    setShowReply(false)
  };

  return (
    <div className="pl-4 border-l border-white/10">
      <div className="mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-blue-400">
            {comment.author}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>
        <p className="text-gray-300">{comment.content}</p>
        <button
          onClick={() => setShowReply((prev) => !prev)}
          className="text-blue-500 text-sm mt-1"
        >
          {showReply ? "Cancel" : "Reply"}
        </button>
      </div>
      {showReply && user && (
        <form onSubmit={handleReplySubmit} className="mb-2">
          <textarea
            onChange={(e) => setRelyComment(e.target.value)}
            className="w-full border border-white/10 bg-transparent p-2 rounded"
            value={replyComment}
            rows={2}
            placeholder="Write a reply ...."
          />
          <button
            type="submit"
            className="mt-1 bg-blue-500 text-white px-3 py-1 rounded"
          >
            Submit
          </button>
        </form>
      )}
      {comment.children && comment.children.length > 0 && (
        <div>
          <button
            onClick={() => setIsClosed((prev) => !prev)}
            title={isClose ? "hide replies" : "show replies"}
          >
            {isClose ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 15l7-7 7 7"
                />
              </svg>
            )}
          </button>

          {!isClose && (
            <div>
              {comment.children.map((childrenComment, key) => {
                return (
                  <div className="space-y-2">
                    <CommentItem
                      key={key}
                      comment={childrenComment}
                      postId={postId}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
