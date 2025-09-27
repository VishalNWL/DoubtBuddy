import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import Axios from "../Utils/Axios.js";
import SummaryAPi from "../Common/SummaryApi.js";
import { Button, Input } from "../Components";
import toast from "react-hot-toast";
import { IoEye, IoEyeOff } from "react-icons/io5";

function ResetPassword() {
  const { state } = useLocation(); // get email, username, schoolId
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Toggle password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async (data) => {
    setError("");

    if (data.newPassword !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        email: state?.email || "",
        username: state?.username || "",
        schoolId: state?.schoolId || "0",
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      };

      const response = await Axios({
        ...SummaryAPi.resetPassword,
        data: payload,
      });

      if (response.data.success) {
        toast.success("Password reset successfully");
        navigate("/login");
      } else {
        setError(response.data.message || "Password reset failed");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit(handleResetPassword)}
        className="bg-blue-100 p-6 rounded-lg w-[90%] md:w-[400px]"
      >
        <h2 className="text-center text-xl font-bold text-blue-800 mb-4">
          Reset Password
        </h2>
        {error && <p className="text-red-500 text-center mb-2">{error}</p>}

        <div className="relative">
          <Input
            label="New Password"
            placeholder="Enter new password"
            type={showNewPassword ? "text" : "password"}
            {...register("newPassword", { required: true })}
          />
          <span
            className="absolute right-3 top-[38px] cursor-pointer text-gray-500"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
          </span>
        </div>

        <div className="relative mt-4">
          <Input
            label="Confirm Password"
            placeholder="Confirm new password"
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword", { required: true })}
          />
          <span
            className="absolute right-3 top-[38px] cursor-pointer text-gray-500"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
          </span>
        </div>

        <Button
          type="submit"
          className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}

export default ResetPassword;
