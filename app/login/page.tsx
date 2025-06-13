"use client";

import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

// Wrapper to keep reCAPTCHA context
function LoginWrapper() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey="6LeLl18rAAAAAKjSL9SXkylxKVJPJZYQBeHlbo6l"
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
        nonce: undefined,
      }}
    >
      <LoginForm />
    </GoogleReCaptchaProvider>
  );
}

// Actual form logic
function LoginForm() {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [user, setUser] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"login" | "otp">("login");
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);

  const onLogin = async () => {
    if (!executeRecaptcha) {
      toast.error("reCAPTCHA not ready");
      return;
    }

    try {
      setLoading(true);
      const token = await executeRecaptcha("login");

      const response = await axios.post("/api/users/login", {
        ...user,
        captchaToken: token,
      });

      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/users/verifyotp", {
        email: user.email,
        otp,
      });
      toast.success("Login successful!");
      router.push("/profile");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setButtonDisabled(!(user.email && user.password));
  }, [user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">{loading ? "Processing..." : "Login"}</h1>
      <hr className="w-full mb-4" />

      {step === "login" ? (
        <>
          <label htmlFor="email">Email</label>
          <input
            className="p-2 border border-gray-300 rounded-lg mb-4 text-black w-72"
            id="email"
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder="email"
          />

          <label htmlFor="password">Password</label>
          <input
            className="p-2 border border-gray-300 rounded-lg mb-4 text-black w-72"
            id="password"
            type="password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            placeholder="password"
          />

          <button
            onClick={onLogin}
            className="p-2 border border-gray-300 rounded-lg mb-4 w-72"
            disabled={buttonDisabled || loading}
          >
            Send OTP
          </button>
        </>
      ) : (
        <>
          <label htmlFor="otp">Enter OTP</label>
          <input
            className="p-2 border border-gray-300 rounded-lg mb-4 text-black w-72"
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit OTP"
          />
          <button
            onClick={onVerifyOtp}
            className="p-2 border border-gray-300 rounded-lg mb-4 w-72"
            disabled={loading || otp.length !== 6}
          >
            Verify OTP
          </button>
        </>
      )}

      <Link href="/forgotpassword" className="mb-2 text-blue-500 hover:underline">
        Forgot Password?
      </Link>
      <Link href="/signup" className="text-blue-500 hover:underline">
        Visit Signup page
      </Link>
    </div>
  );
}

export default LoginWrapper;
