import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = localFont({
  src: "../public/fonts/PlayfairDisplay-VariableFont_wght.ttf",
  variable: "--font-playfair",
});

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}) {
  return (
    <SessionProvider session={session}>
      <main className={`${inter.variable} ${playfair.variable} font-sans`}>
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
}
