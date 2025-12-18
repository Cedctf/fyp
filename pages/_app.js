import { useRef, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { useRouter } from "next/router";
import "@/styles/globals.css";
import Footer from "@/components/Footer";

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
  const router = useRouter();
  const contentRef = useRef(null);

  useEffect(() => {
    // Only apply the effect if NOT on the landing page
    if (router.pathname === "/") return;

    const adjustFooterReveal = () => {
      const footer = document.getElementById('footer');
      if (contentRef.current && footer) {
        contentRef.current.style.marginBottom = `${footer.offsetHeight}px`;
      }
    };

    // Initial check and event listener
    adjustFooterReveal();
    window.addEventListener('resize', adjustFooterReveal);

    // Cleanup
    return () => window.removeEventListener('resize', adjustFooterReveal);
  }, [router.pathname]);

  const showFooter = !['/', '/dengue-heatmap', '/api-dashboard', '/auth/signin', '/auth/signup', '/auth/usertype', '/profile'].includes(router.pathname);

  return (
    <SessionProvider session={session}>
      <main className={`${inter.variable} ${playfair.variable} font-sans`}>
        {/* Content Wrapper for Curtain Effect */}
        <div
          ref={contentRef}
          className="relative z-10"
        >
          <Component {...pageProps} />
        </div>

        {showFooter && <Footer />}
      </main>
    </SessionProvider>
  );
}
