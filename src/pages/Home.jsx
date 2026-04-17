// react
import React, { useEffect, useState } from "react";
// index file
import { PinsGrid } from "../components/index";
// redux
import { useSelector, useDispatch } from "react-redux";
import { addPins } from "../store/pinSlice";
// appwrite
import appwriteService from "../appwrite/config";

const Home = () => {
  // states
  const [pins, setPins] = useState([]);

  // redux
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.authStatus);
  const StoredPins = useSelector((state) => state.pins.pins);
  const { isSearching, searchResult , reload} = useSelector((state) => state.pins);

  // functions
  const Listposts = async () => {
    await appwriteService.ListPosts().then((posts) => {
      posts ? setPins(posts) : null;
    });
  };

  // useEffect's
  useEffect(() => {
    if (status) {
      Listposts();
    }
    if (pins) {
      dispatch(addPins(pins));
    }
  }, [dispatch,reload]);

  //  conditional Rendering :isSearching?
  if (isSearching) {
    return (
      <div className=" w-full ">
        <PinsGrid pin={searchResult} />
      </div>
    );
  }

  return (
    <div className=" w-full ">
      <PinsGrid pin={StoredPins} />
    </div>
  );
};

export default Home;
