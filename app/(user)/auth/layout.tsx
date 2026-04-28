"use client";

import { useAuth } from "@/provider/auth-provider";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user]);
  
  return (
    <div>{children}</div>
  )
}

export default AuthLayout;