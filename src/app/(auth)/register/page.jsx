"use client";
import { useAuthStore } from "@/store/authStore";
import React, { useState } from 'react';

function RegisterPage() {
  const { createAccount, login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // collect data
    const formData = new FormData(e.currentTarget);
    const firstname = formData.get("firstName");
    const lastname = formData.get("lastName");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    // validate
    if (!firstname || !lastname || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await createAccount(
      `${firstname} ${lastname}`,
      email.toString(),
      password.toString()
    );

    if (response?.error) {
      setError(response.error.message);
    } else {
      const loginResponse = await login(email.toString(), password.toString());
      if (loginResponse?.error) {
        setError(loginResponse.error.message);
      }
    }

    setIsLoading(false);
  };

  return (
    <div>
      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input type="text" name="firstName" placeholder="First Name" />
        <input type="text" name="lastName" placeholder="Last Name" />
        <input type="email" name="email" placeholder="Email" />
        <input type="password" name="password" placeholder="Password" />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
