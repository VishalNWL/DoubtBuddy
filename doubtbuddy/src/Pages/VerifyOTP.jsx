import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Axios from "../Utils/Axios.js";
import SummaryAPi from "../Common/SummaryApi.js";
import { Button, Input } from "../Components";
import toast from "react-hot-toast";
import { useEffect } from "react";

function VerifyOtp() {
  const { state } = useLocation(); // ✅ get payload passed from ForgetPassword
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");

  const [minutes, setminutes] = useState(1);
  const [seconds, setseconds] = useState(60);

useEffect(() => {
    // Set up the interval
    const timer = setInterval(() => {
        
        // Use a functional update for SECONDS
        setseconds(prevSeconds => {
            // Check for end of time
            if (prevSeconds <= 0 && minutes <= 0) { // Still needs external 'minutes' state
                clearInterval(timer);
                return 0;
            }

            // Check if a minute needs to be decremented
            if (prevSeconds <= 0 && minutes > 0) {
                // Use a functional update for MINUTES
                setminutes(prevMinutes => prevMinutes - 1);
                return 59; // Seconds reset to 59
            }
            
            // Default: Decrement seconds
            return prevSeconds - 1;
        });

    }, 1000);

    // CLEANUP: This is how you "come out from" the timer.
    // It runs when the component unmounts, or before the effect runs again.
    return () => {
        clearInterval(timer);
    };

// DEPENDENCY ARRAY: Needs 'minutes' because it is accessed outside the functional updater
}, [minutes]);

  const resend = async () => {
    setError("");

    try {
      setResendLoading(true);

      const payload = {
        email: state?.email || "", // if user login
        username: state?.username || "",
        schoolId: state?.schoolId || "0",
      };

      const response = await Axios({ 
        ...SummaryAPi.sendOTP,
        data: payload,
      });

      if (response.data.success) {
        toast.success(response.data.message || "OTP sent successfully");
         setminutes(5);
         setseconds(60);
        // ✅ redirect to OTP verification page
        navigate("/verify-otp", { state: payload });
      } else {
        setError(response.data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setResendLoading(false);
    }
  };

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

        <div className="flex justify-between">
          {resendLoading ?"Sending...":<button onClick={resend}><p>{minutes<=0 && seconds <=0 ? 'Resend':`${minutes}:${seconds}`}</p></button>}
          <Link to={'/forgotpassword'}><p>Change email</p></Link>
        </div>

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
