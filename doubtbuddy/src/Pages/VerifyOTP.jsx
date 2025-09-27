import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Axios from "../Utils/Axios.js";
import SummaryAPi from "../Common/SummaryApi.js";
import { Button, Input } from "../Components";
import toast from "react-hot-toast";

function VerifyOtp() {
  const { state } = useLocation(); // ✅ get payload passed from ForgetPassword
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerifyOtp = async (data) => {
    setError("");
    try {
      setLoading(true);

      const payload = {
        otp: data.otp,
        email: state?.email || "", // if user login
        username: state?.username || "",
        schoolId: state?.schoolId || "0",
      };

      const response = await Axios({
        ...SummaryAPi.verifyOTP,
        data: payload,
      });

      if (response.data.success) {
        toast.success("OTP Verified Successfully");

        // ✅ navigate to reset password page with the same state
        navigate("/reset-password", { state: payload });
      } else {
        setError(response.data.message || "OTP verification failed");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit(handleVerifyOtp)}
        className="bg-blue-100 p-6 rounded-lg w-[90%] md:w-[400px]"
      >
        <h2 className="text-center text-xl font-bold text-blue-800 mb-4">
          Verify OTP
        </h2>
        {error && <p className="text-red-500 text-center mb-2">{error}</p>}

        <Input
          label="Enter OTP"
          placeholder="Enter the OTP you received"
          type="text"
          {...register("otp", { required: true })}
        />

        <Button
          type="submit"
          className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>
      </form>
    </div>
  );
}

export default VerifyOtp;
