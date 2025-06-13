"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    try {
      const res = await axios.post("/api/users/verify-login-otp", { email, otp });
      toast.success("Login verified!");
      router.push("/profile");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "OTP verification failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1>Verify OTP</h1>
      <input
        className="p-2 border rounded mb-2 text-black"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="p-2 border rounded mb-2 text-black"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button onClick={handleVerify} className="p-2 border rounded">
        Verify & Login
      </button>
    </div>
  );
}
