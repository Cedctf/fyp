import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/serviceWorker";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = localFont({
  src: [
    {
      path: "../public/fonts/PlayfairDisplay-VariableFont_wght.ttf",
      style: "normal",
    },
    {
      path: "../public/fonts/PlayfairDisplay-Italic-VariableFont_wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-playfair",
});

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}) {
  useEffect(() => {
    // Register service worker for background location tracking
    registerServiceWorker();
  }, []);

  return (
    <SessionProvider session={session}>
      <main className={`${inter.variable} ${playfair.variable} font-sans`}>
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
}
