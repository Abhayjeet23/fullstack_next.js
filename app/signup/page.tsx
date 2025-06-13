"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();

  const [user, setUser] = useState({
    email: "",
    password: "",
    username: "",
  });

  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    try {
      setLoading(true);

      const response = await axios.post("/api/users/signup", user);
      console.log("Signup API response:", response); 

      toast.success(response.data?.message || "Signup successful!");
      router.push("/login");
    } catch (error: any) {
      console.error("Signup failed:", error);
      const errorMessage = error?.response?.data?.error || "Signup failed";
      toast.error(errorMessage); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { email, password, username } = user;
    setButtonDisabled(!(email && password && username));
  }, [user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 px-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {loading ? "Processing..." : "Signup"}
      </h1>

      <label htmlFor="username" className="w-full text-left mb-1 font-semibold">
        Username
      </label>
      <input
        id="username"
        type="text"
        className="p-2 border border-gray-300 rounded-lg mb-4 w-full focus:outline-none focus:border-gray-600 text-black"
        placeholder="Enter username"
        value={user.username}
        onChange={(e) => setUser({ ...user, username: e.target.value })}
      />

      <label htmlFor="email" className="w-full text-left mb-1 font-semibold">
        Email
      </label>
      <input
        id="email"
        type="email"
        className="p-2 border border-gray-300 rounded-lg mb-4 w-full focus:outline-none focus:border-gray-600 text-black"
        placeholder="Enter email"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
      />

      <label htmlFor="password" className="w-full text-left mb-1 font-semibold">
        Password
      </label>
      <input
        id="password"
        type="password"
        className="p-2 border border-gray-300 rounded-lg mb-4 w-full focus:outline-none focus:border-gray-600 text-black"
        placeholder="Enter password"
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
      />

      <button
        onClick={onSignup}
        disabled={buttonDisabled || loading}
        className={`p-2 rounded-lg mb-4 w-full ${
          buttonDisabled
            ? "bg-gray-300 text-gray-700 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {buttonDisabled ? "Enter all fields" : loading ? "Signing up..." : "Sign Up"}
      </button>

      <Link href="/login" className="text-blue-500 underline">
        Already have an account? Login
      </Link>
    </div>
  );
}
