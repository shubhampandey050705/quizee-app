"use client";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/router";
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
      router.push("/"); // Redirect on success
    }

    setIsLoading(false);
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" />
        <input type="password" name="password" placeholder="Password" />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
