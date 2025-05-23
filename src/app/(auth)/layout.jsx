"use client";
import { useAuthStore } from "@/zustandStore/Auth";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

const Layout = (props) => {
  const { session } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  if (session) {
    return null;
  }

  return (
    <div className="">
      <div className="">{props.children}</div>
    </div>
  );
};

export default Layout;
