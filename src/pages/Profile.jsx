import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";

import { PinsGrid, Button } from "../components";
import appwriteService from "../appwrite/config";
import { Query } from "appwrite";

import { useSelector } from "react-redux";

const Profile = () => {
  const { userId } = useParams();

  const { userdata, prefs } = useSelector((state) => state.authStatus);
  const savedStore = useSelector((state) => state.pins.savedPinsDATA);

  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  const [author, setAuthor] = useState("");
  const [authorDp, setAuthorDp] = useState("");

  const [pins, setPins] = useState([]);
  const [savedPins, setSavedPins] = useState([]);

  const [showSaved, setShowSaved] = useState(false);

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const owner = userId === userdata?.$id;
        setIsOwner(owner);

        // ===== USER PINS =====
        const postRes = await appwriteService.ListPosts([
          Query.equal("userId", userId),
        ]);

        setPins(postRes.documents || []);

        // ===== AUTHOR INFO =====
        if (postRes.documents.length > 0) {
          setAuthor(postRes.documents[0].auther);
          setAuthorDp(postRes.documents[0].autherDp);
        } else if (owner) {
          setAuthor(userdata.name);
          setAuthorDp(prefs.displayPicture);
        }

        // ===== SAVED PINS =====
        if (owner) {
          setSavedPins(savedStore || []);
        } else {
          const savedRes = await appwriteService.ListSavePosts(userId);

          const ids = savedRes.documents.map((i) => i.pinId);

          if (ids.length > 0) {
            const posts = await appwriteService.ListPosts([
              Query.equal("$id", ids),
            ]);

            setSavedPins(posts.documents || []);
          } else {
            setSavedPins([]);
          }
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // ================= UI =================
  return (
    <div className="w-full min-h-screen bg-white">
      {/* PROFILE HEADER */}
      <div className="flex flex-col items-center py-10">
        {/* DP */}
        <LazyLoadImage
          src={authorDp}
          alt={author}
          effect="blur"
          className="w-28 h-28 rounded-full object-cover"
        />

        {/* NAME */}
        <h1 className="text-2xl font-semibold mt-4">
          {loading ? "Loading..." : author}
        </h1>

        {/* BUTTONS */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setShowSaved(false)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
              !showSaved ? "bg-black text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            Created
          </button>

          <button
            onClick={() => setShowSaved(true)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
              showSaved ? "bg-black text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            Saved
          </button>
        </div>
      </div>

      {/* PINS GRID */}
      <div className="px-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading pins...</p>
        ) : (
          <PinsGrid pin={showSaved ? savedPins : pins} userPins={true} />
        )}
      </div>
    </div>
  );
};

export default Profile;
