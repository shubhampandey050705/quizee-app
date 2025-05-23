"use client";

import { useState, useEffect } from "react";
import { avatars } from "@/models/client/config";
import { users } from "@/models/server/config";
import convertDateToRelativeTime from "@/utils/relativeTime";
import React from "react";
import EditButton from "./EditButton";
import Navbar from "./Navbar";
import { IconClockFilled, IconUserFilled } from "@tabler/icons-react";

const Layout = ({ children, params }) => {
  const { userId } = params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await users.get(userId);
        setUser(userData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <p>Loading user...</p>;
  if (error) return <p>Error loading user: {error.message}</p>;
  if (!user) return <p>User not found.</p>;

  return (
    <div className="container mx-auto space-y-4 px-4 pb-20 pt-32">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="w-40 shrink-0">
          <picture className="block w-full">
            <img
              src={avatars.getInitials(user.name, 200, 200).href}
              alt={user.name}
              className="h-full w-full rounded-xl object-cover"
            />
          </picture>
        </div>
        <div className="w-full">
          <div className="flex items-start justify-between">
            <div className="block space-y-0.5">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-lg text-gray-500">{user.email}</p>
              <p className="flex items-center gap-1 text-sm font-bold text-gray-500">
                <IconUserFilled className="w-4 shrink-0" /> Dropped{" "}
                {convertDateToRelativeTime(new Date(user.$createdAt))},
              </p>
              <p className="flex items-center gap-1 text-sm text-gray-500">
                <IconClockFilled className="w-4 shrink-0" /> Last activity&nbsp;
                {convertDateToRelativeTime(new Date(user.$updatedAt))}
              </p>
            </div>
            <div className="shrink-0">
              <EditButton />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Navbar />
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
