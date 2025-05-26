"use client";
import { useAuthStore } from "@/zustandStore/Auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";


function LoginPage() {
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();


  const handleSubmit = async (e) => {
  e.preventDefault();

  // collect data
  const formData = new FormData(e.currentTarget);
  const email = formData.get("email");
  const password = formData.get("password");

  // validate
  if (!email || !password) {
    setError("All fields are required");
    return;
  }

  setIsLoading(true);
  setError(null);

  const loginResponse = await login(email.toString(), password.toString());

  if (loginResponse?.error) {
    setError(loginResponse.error.message);
  } else {
    console.log("✅ Login successful:", loginResponse); // 👈 Log here
    router.push("/"); // Redirect on success
  }

  setIsLoading(false);
};


  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

      {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  </div>
);

}

export default LoginPage;
