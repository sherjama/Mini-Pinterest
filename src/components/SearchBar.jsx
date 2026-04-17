import { FaSearch } from "react-icons/fa";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addSearchPins } from "../store/pinSlice";
import appwriteService from "../appwrite/config";

const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

const SearchBar = ({ className = "" }) => {
  const dispatch = useDispatch();
  const redux_pins = useSelector((state) => state.pins.pins);

  const [pins, setPins] = useState([]);
  const [focus, setFocus] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notFound, setNotFound] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 400);

  const safe = (val) => val?.toLowerCase?.() || "";

  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await appwriteService.ListPosts();
      if (posts) setPins(posts.documents);
    };
    fetchPosts();
  }, [redux_pins]);

  const filteredPins = useMemo(() => {
    if (!debouncedSearch) return pins;

    return pins.filter((pin) => {
      return (
        safe(pin.title).includes(debouncedSearch) ||
        safe(pin.description).includes(debouncedSearch) ||
        safe(pin.auther).includes(debouncedSearch) ||
        safe(pin.board).includes(debouncedSearch) ||
        (pin.tag || []).some((tag) => safe(tag).includes(debouncedSearch))
      );
    });
  }, [debouncedSearch, pins]);

  useEffect(() => {
    if (debouncedSearch.length > 0) {
      if (filteredPins.length === 0) {
        setNotFound(true);
      } else {
        setNotFound(false);
        dispatch(addSearchPins(filteredPins));
      }
    } else {
      setNotFound(false);
      dispatch(addSearchPins(pins));
    }
  }, [debouncedSearch, filteredPins, pins, dispatch]);

  return (
    <div className={`${className} h-12`}>
      <form
        onSubmit={(e) => e.preventDefault()}
        className={`h-full relative flex items-center justify-center
        bg-gray-200 rounded-3xl shadow-sm px-2 ${
          focus ? "ring-blue-400 ring-2" : ""
        }`}
      >
        <span className="p-3">
          <FaSearch />
        </span>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase().trim())}
          placeholder="Search"
          className="w-full h-full bg-transparent px-3 outline-none"
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        />

        {notFound && (
          <p className="absolute right-3 text-xs text-red-500">Not Found</p>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
