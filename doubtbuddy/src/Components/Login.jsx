import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as authLogin } from "../store/authSlice";
import { Button, Input, Logo } from "./index.js";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import Axios from "../Utils/Axios.js";
import SummaryAPi from "../Common/SummaryApi.js";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { IoEye, IoEyeOff } from "react-icons/io5";

function Login() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { handleSubmit, register, reset } = useForm();
  const user = useSelector((state) => state.auth).userData;
  const [showPassword, setShowPassword] = useState(false);

  // 👇 toggle user/school login
  const [loginType, setLoginType] = useState("user"); // "user" | "school"

 const login = async (data) => {
  setError("");

  try {
    setLoading(true);

    let session;
    if (loginType === "user") {
      session = await Axios({
        ...SummaryAPi.login,
        data,
      });
    } else {
      session = await Axios({
        ...SummaryAPi.schoolLogin,
        data,
      });
    }

    if (session.data.success) {
      toast.success(session.data.message || "Login successful");

      localStorage.setItem("accesstoken", session.data.data.accessToken);
      localStorage.setItem("refreshtoken", session.data.data.refreshToken);

      const profileResponse = await Axios({ ...SummaryAPi.userDetails });

      if (profileResponse.data.success) {
        const dataFetched = profileResponse.data.data;
        dispatch(authLogin(dataFetched));

        if (loginType === "user") {
          if (dataFetched?.role === "teacher") {
            navigate("/teacherdashboard");
          } else if (dataFetched?.role === "student") {
              try {
              const Class = dataFetched.class
              const stream = dataFetched.class>10 ? dataFetched.stream : null;

              const subinfo= await Axios({
              ...SummaryAPi.getSubject,
              data: {Class , school:dataFetched.school ,stream}
              })

              dispatch(setSubject(subinfo));
            } catch (error) {
              console.log(error);
            }
            navigate("/studentdashboard");
          }
        } else {
          navigate("/schooldashboard");
        }
      }
    } else {
      // 👇 if backend responds with success=false
      setError(session.data.message || "Invalid credentials");
    }
  } catch (err) {
    console.error("Login error:", err);

    // 👇 show backend error message properly
    const backendMessage =
      err.response?.data?.message || err.message || "Something went wrong";

    setError(backendMessage);
  } finally {
    setLoading(false);
  }
};

useEffect(()=>{
  console.log(user)
  if (user && loginType === "user" && user?.username) {
    if (user?.role === "teacher") {
      navigate("/teacherdashboard");
    } else if (user?.role === "student") {
      navigate("/studentdashboard");
    }
   //TODO:Add navigate to admin dashboard
  }
  else if(user && user?.schoolId){
    navigate('/schooldashboard')
  }
},[user,loginType])

  return (
    !user && (
      <>
        <div className="w-full min-h-screen flex flex-col flex-nowrap custom:items-center custom:justify-center">
          <div className="h-[20rem] w-full bg-blue-600 rounded-tr-[10rem] rounded-bl-[10rem] custom:w-[50%] custom:hidden flex items-center justify-center">
            <Logo />
          </div>

          <div className="hidden custom:block ">
            <Logo />
          </div>

          <div className="mt-6 custom:w-[50%] block ">
            <h1 className="text-blue-800 text-6xl font-poppins text-center">
              Welcome
            </h1>
            {!error && (
              <h2 className="text-blue-800 text-center text-lg font-poppins">
                Login to your account to continue
              </h2>
            )}
            {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
          </div>

          {/* 👇 toggle between User / School */}
          <div className="flex justify-center mt-6 space-x-4">
            <Button
              type="button"
              className={`px-4 py-2 rounded-lg ${
                loginType === "user" ? "bg-blue-600 text-white" : "bg-gray-400"
              }`}
              onClick={() => {
                setLoginType("user");
                reset();
              }}
            >
              User Login
            </Button>
            <Button
              type="button"
              className={`px-4 py-2 rounded-lg ${
                loginType === "school" ? "bg-blue-600 text-white" : "bg-gray-400"
              }`}
              onClick={() => {
                setLoginType("school");
                reset();
              }}
            >
              School Login
            </Button>
          </div>

          {/* 👇 login form */}
          <form
            onSubmit={handleSubmit(login)}
            className="mt-8 pl-4 pr-4 custom:bg-blue-100 custom:rounded-md custom:p-10 block"
          >
            <div className="space-y-5">
              {loginType === "user" ? (
                <>
                  <Input
                    label="Username: "
                    placeholder="Enter your Username"
                    type="text"
                    {...register("username", {
                      required: true,
                    })}
                  />
                  <Input
                    label="Email: "
                    placeholder="Enter your email"
                    type="text"
                    {...register("email", {
                      required: true,
                    })}
                  />
                  <div className="relative">
                    <Input
                      label="Password: "
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password", {
                        required: true,
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-10 text-gray-600 hover:text-gray-900"
                    >
                      {showPassword ? (
                        <IoEyeOff size={20} />
                      ) : (
                        <IoEye size={20} />
                      )}
                    </button>
                     <Link to={'/forgotpassword'}><h5 className="text-blue-700 hover:underline">Forgot Password?</h5></Link>
                  </div>
                </>
              ) : (
                <>
                  <Input
                    label="School ID: "
                    placeholder="Enter School ID"
                    type="text"
                    {...register("schoolId", {
                      required: true,
                    })}
                  />
                  <div className="relative">
                    <Input
                      label="Password: "
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password", {
                        required: true,
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-10 text-gray-600 hover:text-gray-900"
                    >
                      {showPassword ? (
                        <IoEyeOff size={20} />
                      ) : (
                        <IoEye size={20} />
                      )}
                    </button>
                    <Link to={'/forgotpassword'}><h5 className="text-blue-700 hover:underline">Forgot Password?</h5></Link>
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white mt-10"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <ClipLoader color="white" size={20} />
                  </div>
                ) : (
                  "Login"
                )}
              </Button>
            </div>

           
              <div className="mt-2">
                Not registered?{" "}
                <Link
                  to={"/signup"}
                  className="text-blue-600 hover:underline"
                >
                  Register
                </Link>
              </div>
            
          </form>
        </div>
      </>
    )
  );
}

export default Login;
