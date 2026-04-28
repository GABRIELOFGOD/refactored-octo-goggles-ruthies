"use client";

import { useAuth } from "@/provider/auth-provider";
import { ReactNode } from "react";
import PageLoader from "./PageLoader";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CurrencyProvider } from "@/context/CurrencyContext";

export const LayoutSub = ({ children }: { children: ReactNode }) => {
  const { isLoading } = useAuth();

  if (isLoading) return <PageLoader />

  return (
    <LanguageProvider>
      <CurrencyProvider>
        <CartProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </CartProvider>
      </CurrencyProvider>
    </LanguageProvider>
  )
}