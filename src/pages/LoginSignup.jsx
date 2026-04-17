// icons
import { FaCamera } from "react-icons/fa";
//loader
import { ThreeCircles } from "react-loader-spinner";
// react
import { React, useEffect, useState } from "react";
// react-hook-form
import { useForm } from "react-hook-form";
// react-router
import { Link, useNavigate, useParams } from "react-router-dom";
// components
import { Logo, Input, uploadFile } from "../components/index";
// authService
import authservice from "../appwrite/auth";

// react-redux redux-toolkit
import { login, session as authSassion, setPref } from "../store/authSlice";
import { useDispatch } from "react-redux";

//cloudinary

const LoginSignup = () => {
  // react-router-dom
  const { what } = useParams();
  const navigate = useNavigate();

  // react-redux Redux-toolkit
  const dispatch = useDispatch();

  // states
  const [isLogin, setIsLogin] = useState();
  const [isSignup, setIsSignup] = useState();
  const [globelError, setGlobelError] = useState("");
  const [image, setImage] = useState();
  const [prevImage, setPrevImage] = useState();
  const [toggle, setToggle] = useState(false);

  // react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // useEffect's
  useEffect(() => {
    setIsLogin(what == "login" ? true : false);
    setIsSignup(what == "signup" ? true : false);
  }, [useParams, what]);

  // functions

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file ? file : null);
    setPrevImage(file ? URL.createObjectURL(file) : null);
  };

  const onSubmit = async ({ email, password, name }) => {
    !toggle ? setToggle(true) : setToggle(false);
    setGlobelError("");
    // LoginPage
    if (isLogin) {
      try {
        const data = await authservice.Login(email, password);
        console.log(data);

        if (data) {
          const userdata = await authservice.getCurrentUser(data.userId);

          if (userdata) {
            const userData = {
              ...userdata,
              id: email,
              password: password,
            };

            dispatch(login(userData));

            // sending redux data to localStorage
            localStorage.setItem("userdata", JSON.stringify(userData));
            localStorage.setItem("id", JSON.stringify(email));
            localStorage.setItem("password", JSON.stringify(password));
            localStorage.setItem("status", "true");
          }

          const session = await authservice.SessionDetail();

          if (session) dispatch(authSassion(session));

          localStorage.setItem("session", JSON.stringify(session));

          const prefs = await authservice.getPrefrencess();

          prefs ? dispatch(setPref(prefs)) : null;
          localStorage.setItem("prefs", JSON.stringify(prefs));
          navigate("/home");
        }
      } catch (e) {
        setGlobelError(e.message);
        e ? setToggle(false) : null;
      }
    } else {
      // signiUp page
      try {
        const data = await authservice.CreateAccout(email, password, name);

        if (data) {
          const userdata = await authservice.getCurrentUser();
          const file = image ? await uploadFile(image) : null;
          if (file) {
            const prefs = await authservice.addPrefrencess({
              displayPicture: file.url,
              displayPicturePublicId: file.publicId,
            });

            if (prefs) {
              const pref = await authservice.getPrefrencess();
              dispatch(setPref(pref));
              localStorage.setItem("prefs", JSON.stringify(pref));
            }
          } else {
            const prefs = await authservice.addPrefrencess({
              displayPicture:
                "https://res.cloudinary.com/dglztjs3z/image/upload/v1771251275/user_jlxwch.jpg",
            });

            if (prefs) {
              const pref = await authservice.getPrefrencess();
              dispatch(setPref(pref));
              localStorage.setItem("prefs", JSON.stringify(pref));
            }
          }

          if (userdata) {
            const userData = {
              ...userdata,
              id: email,
              password: password,
            };

            dispatch(login(userData));
            // sending redux data to localStorage
            localStorage.setItem("userdata", JSON.stringify(userData));
            localStorage.setItem("id", JSON.stringify(email));
            localStorage.setItem("password", JSON.stringify(password));
            localStorage.setItem("status", "true");
          }

          const session = await authservice.SessionDetail();

          if (session) dispatch(authSassion(session));

          localStorage.setItem("session", JSON.stringify(session));

          navigate("/home");
        }
      } catch (error) {
        setGlobelError(error.message);
        error ? setToggle(false) : null;
        console.log(error);
      }
    }
  };

  // OAuth2 in service available in future
  // const OAuth2LoginFunc = async (params) => {
  //   let provider;
  //   let session;
  //   const success_URL = "http://localhost:5173/explore";
  //   const failure_URL = "http://localhost:5173/404";
  //   if (params === "google") {
  //     provider = OAuthProvider.Google;
  //   } else {
  //     provider = OAuthProvider.Facebook;
  //   }
  //   const OAuth2 = await authservice.OAuth2Login(
  //     provider,
  //     success_URL,
  //     failure_URL
  //   );

  //   if (OAuth2) session = await authservice.SessionDetail();

  //   if (session) dispatch(authSassion(session));
  // };

  return (
    <div className="min-h-[90vh] w-full flex justify-center items-center ">
      <div className="bg-white shadow-md rounded-[4rem] p-8 w-full max-w-md min-h-96 border-2 border-solid border-gray-100  max-[520px]:w-[85%]">
        <div className="flex flex-col items-center justify-center">
          <div>
            {isLogin && (
              <div className="p-6">
                <Logo size={50} />
              </div>
            )}
          </div>

          <div>
            {isSignup && (
              <div>
                {image ? (
                  <img
                    src={prevImage}
                    alt="Preview"
                    className="size-40 rounded-full object-cover mb-4 hover:backdrop-blur-3xl hover:opacity-50"
                  />
                ) : (
                  <label className="size-40 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-500">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png, image/jpg, image/jpeg, image/gif"
                      onChange={handleImageChange}
                      // {...register("profilePicture")}
                    />
                    <span className="text-gray-400 flex items-center justify-center flex-col-reverse">
                      add profile picture
                      <FaCamera size={50} />
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>

          {globelError && (
            <p className="text-red-600 mt-8 text-center">{globelError}</p>
          )}
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* name Input */}
          {isSignup && (
            <div className="mb-4">
              <Input
                className={`${
                  errors.name ? "border-red-500" : "border-gray-300"
                } `}
                type="name"
                label="name"
                {...register("name", { required: "name is required" })}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
          )}

          {/* Email Input */}
          <div className="mb-4">
            <Input
              className={`${
                errors.email ? "border-red-500" : "border-gray-300"
              } `}
              type="email"
              label="Email"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <Input
              className={`w-full px-4 py-2 mt-1 border  rounded-md focus:ring-red-500 focus:border-red-500
                ${errors.password ? "border-red-500" : "border-gray-300"}`}
              type="password"
              label="Password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className=" flex items-center justify-center w-full bg-red-600 text-white py-2 px-4 rounded-3xl font-Primary font-semibold
             hover:bg-red-800 transition"
          >
            {!toggle && <p>{isLogin ? "Log in" : "Create account"}</p>}
            {toggle && (
              <ThreeCircles
                visible={true}
                height="30"
                width="30"
                color="#ffff"
                ariaLabel="three-circles-loading"
                wrapperStyle={{}}
                wrapperClass=""
              />
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-3 text-gray-600 text-sm">OR</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>
          {/* Continue with Facebook Button */}
          {/* <button
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-3xl hover:bg-blue-700 flex items-center justify-center font-Primary font-bold mb-2 text-sm"
            onClick={() => OAuth2LoginFunc("facebook")}
          >
            <FaFacebook size={30} color="white" className="relative right-16" />
            Continue with Facebook
          </button> */}

          {/* Continue with Google Button */}
          {/* <button
            className="w-full bg-white border border-gray-300 text-gray-600 py-2 px-4 rounded-3xl hover:bg-gray-100 flex items-center  font-Primary font-medium text-sm text-center
          justify-center"
            onClick={() => OAuth2LoginFunc("google")}
            // ref={googleBtn}
          >
            <FcGoogle size={30} className="relative right-20" />
            Continue with Google
          </button> */}
        </form>

        {/* Additional links */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            {isLogin
              ? "Don't have an account?  "
              : "Already have an account?  "}
            <Link
              to={isLogin ? "/auth/signup" : "/auth/login"}
              className="text-red-500 hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
