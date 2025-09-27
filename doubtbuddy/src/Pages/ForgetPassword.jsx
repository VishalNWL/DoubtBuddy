import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Logo } from "../Components/index.js";
import { useForm } from "react-hook-form";
import Axios from "../Utils/Axios.js";
import SummaryAPi from "../Common/SummaryApi.js";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";

function ForgetPassword() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { handleSubmit, register, reset } = useForm();
  const [loginType, setLoginType] = useState("user"); // "user" | "school"

  const handleSendOtp = async (formData) => {
    setError("");

    try {
      setLoading(true);

      let payload;
      if (loginType === "user") {
        payload = {
          email: formData.email,
          username: formData.username,
          schoolId: "0", // mark as normal user
        };
      } else {
        payload = {
          email: formData.email || "", // if email not required for school, can skip
          schoolId: formData.schoolId,
        };
      }

      const response = await Axios({
        ...SummaryAPi.sendOTP,
        data: payload,
      });

      if (response.data.success) {
        toast.success(response.data.message || "OTP sent successfully");

        // ✅ redirect to OTP verification page
        navigate("/verify-otp", { state: payload });
      } else {
        setError(response.data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col flex-nowrap custom:items-center custom:justify-center">
      <div className="h-[20rem] w-full bg-blue-600 rounded-tr-[10rem] rounded-bl-[10rem] custom:w-[50%] custom:hidden flex items-center justify-center">
        <Logo />
      </div>

      <div className="hidden custom:block">
        <Logo />
      </div>

      <div className="mt-6 custom:w-[50%] block">
        <h1 className="text-blue-800 text-6xl font-poppins text-center">
          Welcome
        </h1>
        {!error && (
          <h2 className="text-blue-800 text-center text-lg font-poppins">
            Reset Your Password
          </h2>
        )}
        {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
      </div>

      {/* Toggle User/School */}
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
          User
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
          School
        </Button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(handleSendOtp)}
        className="mt-8 pl-4 pr-4 custom:bg-blue-100 custom:rounded-md custom:p-10 block"
      >
        <div className="space-y-5">
          {loginType === "user" ? (
            <>
              <Input
                label="Username: "
                placeholder="Enter your Username"
                type="text"
                {...register("username", { required: true })}
              />
              <Input
                label="Email: "
                placeholder="Enter your email"
                type="email"
                {...register("email", { required: true })}
              />
            </>
          ) : (
            <>
              <Input
                label="School ID: "
                placeholder="Enter School ID"
                type="text"
                {...register("schoolId", { required: true })}
              />
              <Input
                label="Email (Optional): "
                placeholder="Enter your email"
                type="email"
                {...register("email")}
              />
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
              "Send OTP"
            )}
          </Button>
        </div>

        <div className="mt-2">
          Remember Password?{" "}
          <Link to={"/login"} className="text-blue-600 hover:underline">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ForgetPassword;
