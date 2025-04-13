import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "../supabse-client";
import { useAuth } from "../context/AuthContext";
// insert data in table
const fnCreatePost = async (post, imageFile) => {
  const filePath = `${post.title}-${Date.now()}-${imageFile.name}`;

  const { uploadedError } = await supabase.storage
    .from("post-image")
    .upload(filePath, imageFile);

  if (uploadedError) throw new Error(uploadedError.message);

  const { data: publicUrl } = supabase.storage
    .from("post-image")
    .getPublicUrl(filePath);

  const { data, error } = await supabase
    .from("posts")
    .insert({ ...post, imageurl: publicUrl });

  if (error) throw new Error(error.message);
  return data;
};

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const {user} = useAuth()
  // making request to supabase table run query to manage client and server side data
  // two hooks primary use when woking with react query for making request
  // useQueryHook and useMuation Hook -- update,edit to service

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (data) => {
      return fnCreatePost(data.post, data.imageFile);
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedFile) return;
    mutate({ post: { title, content,profile_pic:user?.user_metadata.avatar_url }, imageFile: selectedFile });
  };

  const handleFileChange = (e) => {
    // check file has value and if multiple file choosen then choose first one
    // e.target.files if choosen multiple than store in array
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      <div>
        <label htmlFor="title" className="block mb-2 font-medium">
          Title
        </label>
        <input
          type="text"
          id="title"
          required
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-white/10 bg-transparent p-2 rounded"
        />
      </div>
      <div>
        <label htmlFor="content" className="block mb-2 font-medium">
          Content
        </label>
        <textarea
          type="text"
          id="content"
          required
          rows={5}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-white/10 bg-transparent p-2 rounded"
        />
      </div>
      <div>
        <label htmlFor="image" className="block mb-2 font-medium">
          upload image
        </label>
        <input
          type="file"
          id="image"
          accept="/image/*"
          required
          onChange={handleFileChange}
          className="w-full text-gray-200"
        />
      </div>
      <button
        type="submit"
        className="bg-purple-500 text-white px-4 py-2 rounded cursor-pointer"
      >
        {isPending ? "Creating..." : "Create Post"}
      </button>

      {isError && <p className="text-red-500"> Error creating post.</p>}
    </form>
  );
};

export default CreatePost;
