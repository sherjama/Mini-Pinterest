import React, { useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import { Dp } from "./index";
import { useNavigate } from "react-router-dom";

const Pin = ({ pinData }) => {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/pin/${pinData.$id}`)}
      className="w-full mb-6 break-inside-avoid cursor-pointer"
    >
      {/* IMAGE */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-200">
        <LazyLoadImage
          src={pinData.image}
          alt={pinData.title}
          effect="blur"
          onLoad={() => setLoaded(true)}
          className={`w-full object-cover transition duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          } hover:scale-[1.02]`}
        />

        {/* Skeleton */}
        {!loaded && (
          <div className="w-full h-60 bg-gray-300 animate-pulse rounded-2xl"></div>
        )}
      </div>

      {/* TEXT CONTENT */}
      <div className="mt-2 px-1">
        {/* Title */}
        <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">
          {pinData.title}
        </p>

        {/* Author */}
        <div className="flex items-center gap-2 mt-2">
          <Dp className="w-7 h-7" cusstomDp={pinData.autherDp} />
          <span className="text-xs text-gray-600">{pinData.auther}</span>
        </div>
      </div>
    </div>
  );
};

export default Pin;
