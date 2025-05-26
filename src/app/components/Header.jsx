"use client";

import React, { useEffect, useMemo } from "react";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconHome, IconMessage, IconWorldQuestion, IconUser } from "@tabler/icons-react";
import { useAuthStore } from "@/zustandStore/Auth";

export default function Header() {
  const { user, hydrated } = useAuthStore();

  useEffect(() => {
    console.log("User in Header:", user);
  }, [user]);

  const navItems = useMemo(() => {
    const items = [
      {
        name: "Home",
        link: "/",
        icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
      },
      {
        name: "Questions",
        link: "/questions",
        icon: (
          <IconWorldQuestion className="h-4 w-4 text-neutral-500 dark:text-white" />
        ),
      },
    ];

    if (user) {
      items.push({
        name: "Profile",
        link: `/Profile`,
        icon: <IconUser className="h-4 w-4 text-neutral-500 dark:text-white" />,
      });
    }

    return items;
  }, [user]);

  if (!hydrated) return null; // wait until Zustand is rehydrated

  return (
    <div className="relative w-full">
      <FloatingNav navItems={navItems} />
    </div>
  );
}
