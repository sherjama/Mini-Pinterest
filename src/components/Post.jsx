import React, { useEffect, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { ThreeCircles } from "react-loader-spinner";
import { TiTickOutline } from "react-icons/ti";
import { MdDelete } from "react-icons/md";
import { TbEdit } from "react-icons/tb";
import { BsThreeDotsVertical } from "react-icons/bs";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import appwriteService from "../appwrite/config";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { saved as setSaved } from "@/store/pinSlice";
import { deleteImage } from "@/cloudinary/delete";

const Post = () => {
  const { postid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.authStatus.userdata);
  const savedPosts = useSelector((state) => state.pins.savedPins);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const isAuthor = post?.userId === user?.$id;

  // ================= FETCH POST =================
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await appwriteService.GetPost(postid);
        setPost(res);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postid]);

  // ================= CHECK SAVED =================
  useEffect(() => {
    const exists = savedPosts?.some((item) => item.pinId === postid);
    setIsSaved(exists);
  }, [savedPosts, postid]);

  // ================= DELETE =================
  const deletePost = async () => {
    try {
      // delete image from cloudinary
      if (post.imagePublicID) {
        await deleteImage(post.imagePublicID);
      }

      // delete post
      await appwriteService.DeletePost(post.$id);

      navigate(`/profile/${post.userId}`);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= SAVE / UNSAVE =================
  const toggleSave = async () => {
    if (!user) return;

    setSaveLoading(true);

    try {
      if (!isSaved) {
        await appwriteService.addSavePost({
          userId: user.$id,
          pinId: postid,
        });
      } else {
        const found = savedPosts.find((i) => i.pinId === postid);
        if (found) {
          await appwriteService.DeleteSavedPost(found.$id);
        }
      }

      // refresh saved pins
      const res = await appwriteService.ListSavePosts(user.$id);
      dispatch(setSaved(res.documents));
    } catch (err) {
      console.log(err);
    } finally {
      setSaveLoading(false);
    }
  };

  // ================= UI =================
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ThreeCircles height="50" width="50" />
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4 py-10 bg-[#f1f1f1] min-h-screen">
      <div className="bg-white rounded-3xl shadow-lg max-w-5xl w-full flex flex-col md:flex-row overflow-hidden">
        {/* IMAGE */}
        <div className="md:w-1/2 bg-gray-100">
          <LazyLoadImage
            src={post.image}
            alt={post.title}
            effect="blur"
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT CONTENT */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          {/* TOP */}
          <div>
            {/* MENU */}
            {isAuthor && (
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <BsThreeDotsVertical size={22} />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/creation-pin/update-${post.$id}`)
                      }
                    >
                      <TbEdit className="mr-2" /> Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={deletePost}>
                      <MdDelete className="mr-2 text-red-500" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* TITLE */}
            <h1 className="text-2xl font-bold mt-4">{post.title}</h1>

            {/* DESC */}
            <p className="text-gray-600 mt-2">{post.description}</p>

            {/* AUTHOR */}
            <div
              onClick={() => navigate(`/profile/${post.userId}`)}
              className="flex items-center gap-3 mt-6 cursor-pointer"
            >
              <img
                src={post.autherDp}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-sm font-medium">{post.auther}</span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => navigate(`/profile/${post.userId}`)}
              className="bg-gray-200 px-4 py-2 rounded-full text-sm"
            >
              Profile
            </button>

            <button
              onClick={toggleSave}
              className={`px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                isSaved ? "bg-green-600 text-white" : "bg-red-500 text-white"
              }`}
            >
              {saveLoading ? (
                <ThreeCircles height="20" width="20" color="#fff" />
              ) : isSaved ? (
                <>
                  Saved <TiTickOutline />
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
