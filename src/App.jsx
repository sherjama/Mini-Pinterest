import LoadingBar from "react-top-loading-bar";
import React, { useEffect, useRef, useState } from "react";
import { Header, Footer } from "./components/index";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addPins, saved, displaySaved } from "./store/pinSlice";
import { setLoading } from "./store/loadSlice";
import appwriteService from "./appwrite/config";
import { Query } from "appwrite";

const App = () => {
  const loadingRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { status, userdata } = useSelector((state) => state.authStatus);
  const saved_posts = useSelector((state) => state.pins.savedPins);

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!status) {
        navigate("/auth/login");
        return;
      }

      if (!userdata?.$id) return;

      try {
        loadingRef.current?.continuousStart();
        dispatch(setLoading(true));

        const id = userdata.$id;
        setUserId(id);

        const [posts, savedData] = await Promise.all([
          appwriteService.ListPosts(),
          appwriteService.ListSavePosts(id),
        ]);

        if (posts) {
          dispatch(addPins(posts.documents || []));
        }

        if (savedData?.total >= 0) {
          dispatch(saved(savedData.documents || []));
        }
      } catch (error) {
        console.error(error);
      } finally {
        dispatch(setLoading(false));
        loadingRef.current?.complete();
      }
    };

    fetchData();
  }, [status, userdata, navigate, dispatch]);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!saved_posts || saved_posts.length === 0) {
        dispatch(displaySaved([]));
        return;
      }

      try {
        const pinIDS = saved_posts.map((item) => item.pinId);

        const post = await appwriteService.ListPosts([
          Query.equal("$id", pinIDS),
        ]);

        if (post?.total >= 0) {
          dispatch(displaySaved(post.documents || []));
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (status) {
      fetchSavedPosts();
    }
  }, [saved_posts, status, dispatch]);

  return (
    <div className="w-full h-screen">
      {status && <LoadingBar color="#f11946" ref={loadingRef} shadow={true} />}

      <Header className="w-full h-[12%] z-50 fixed top-0 bg-white" />

      <div className="w-full h-[12%]" />

      <main className="w-full min-h-min">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default App;
