"use client";

import { useAuth } from "@/provider/auth-provider";
import { ReactNode } from "react";
import PageLoader from "./PageLoader";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

export const LayoutSub = ({ children }: { children: ReactNode }) => {
  const { isLoading } = useAuth();

  if (isLoading) return <PageLoader />

  return (
    <CartProvider>
      <WishlistProvider>
        {children}
      </WishlistProvider>
    </CartProvider>
  )
}