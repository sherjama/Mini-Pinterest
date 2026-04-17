import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { IoIosAddCircleOutline } from "react-icons/io";
import { TbEdit } from "react-icons/tb";
import { ThreeCircles } from "react-loader-spinner";

import { uploadFile, deleteImage } from "../index";
import appwriteService from "../../appwrite/config";
import { triggerReload } from "@/store/pinSlice";

const CreateUpdatePin = () => {
  const { state } = useParams();
  const navigate = useNavigate();

  const { userdata, prefs } = useSelector((state) => state.authStatus);

  const isCreate = state === "create";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [post, setPost] = useState(null);

  const [tags, setTags] = useState([]);
  const [inputTag, setInputTag] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  // ================= FETCH POST =================
  useEffect(() => {
    if (!isCreate) fetchPost();
  }, [state]);

  const fetchPost = async () => {
    try {
      const postId = state.slice(7);
      const res = await appwriteService.GetPost(postId);
      console.log("state :", state);
      console.log("postid :", postId);

      setPost(res);
      setPreview(res.image);
      setValue("title", res.title);
      setValue("description", res.description);
      setTags(res.tag || []);
    } catch (err) {
      setError(err.message);
    }
  };

  // ================= IMAGE =================
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // ================= TAGS =================
  const addTag = () => {
    const trimmed = inputTag.trim();
    if (!trimmed || tags.includes(trimmed)) return;

    setTags([...tags, trimmed]);
    setInputTag("");
  };

  const handleTagKey = (e) => {
    if (e.key === " ") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // ================= SUBMIT =================
  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      let uploadedFile = null;

      if (image) {
        uploadedFile = await uploadFile(image);
      }

      const payload = {
        ...data,
        tag: tags,
        status: true,
      };

      // ================= UPDATE =================
      if (!isCreate) {
        if (uploadedFile) {
          // delete old image
          if (post.imagePublicID) {
            await deleteImage(post.imagePublicID);
          }

          payload.imagePublicID = uploadedFile.publicId;
          payload.image = uploadedFile.url; // ✅ FIX (IMPORTANT)
        } else {
          payload.imagePublicID = post.imagePublicID;
          payload.image = post.image; // ✅ keep old image
        }

        await appwriteService.UpdatePost(post.$id, payload);
        navigate("/home");
      }

      // ================= CREATE =================
      else {
        if (!uploadedFile) {
          setError("Image is required");
          return;
        }

        payload.imagePublicID = uploadedFile.publicId;
        payload.image = uploadedFile.url; // ✅ FIX (IMPORTANT)

        await appwriteService.CreatePost({
          ...payload,
          userId: userdata.$id,
          auther: userdata.name,
          autherDp: prefs.displayPicture,
        });

        navigate(`/profile/${userdata.$id}`);
      }

      // ================= RESET =================
      reset();
      setTags([]);
      setImage(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="min-h-screen bg-[#f1f1f1] flex justify-center items-center px-4">
        <div className="bg-white w-full max-w-5xl rounded-3xl shadow-lg p-6 flex gap-8">
          {/* LEFT - IMAGE */}
          <div className="w-1/2">
            {preview ? (
              <div className="relative group">
                <img
                  src={preview}
                  className="w-full h-[450px] object-cover rounded-3xl"
                />

                {/* Edit overlay */}
                <label className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-md cursor-pointer opacity-0 group-hover:opacity-100 transition">
                  <TbEdit size={18} />
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            ) : (
              <label className="w-full h-[450px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-3xl cursor-pointer hover:border-gray-400 transition">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <span className="text-gray-400 text-sm">
                  Click to upload image
                </span>
              </label>
            )}
          </div>

          {/* RIGHT - FORM */}
          <div className="w-1/2 flex flex-col justify-between">
            {/* TOP */}
            <div>
              <h2 className="text-2xl font-semibold mb-5">
                {isCreate ? "Create Pin" : "Edit Pin"}
              </h2>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              {/* TITLE */}
              <input
                {...register("title", { required: "Title required" })}
                placeholder="Add a title"
                className="w-full text-3xl font-bold outline-none border-b border-gray-200 pb-2 mb-5 placeholder-gray-400"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mb-2">
                  {errors.title.message}
                </p>
              )}

              {/* DESCRIPTION */}
              <textarea
                {...register("description", {
                  required: "Description required",
                })}
                placeholder="Tell everyone what your Pin is about"
                rows="4"
                className="w-full p-3 rounded-xl bg-gray-100 outline-none resize-none text-sm"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}

              {/* TAGS */}
              <div className="mt-5">
                <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl">
                  <input
                    value={inputTag}
                    onChange={(e) => setInputTag(e.target.value)}
                    onKeyDown={handleTagKey}
                    placeholder="Add tags"
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="text-red-500 hover:scale-110 transition"
                  >
                    <IoIosAddCircleOutline size={24} />
                  </button>
                </div>

                {/* TAG LIST */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-600 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-full font-semibold flex justify-center items-center transition"
            >
              {loading ? (
                <ThreeCircles height="25" width="25" color="#fff" />
              ) : isCreate ? (
                "Create"
              ) : (
                "Update"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateUpdatePin;
