
import { Bebas_Neue, Inter, Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SmoothScroll from "@/components/main/Smoothscroll";
import Navbar from "@/components/main/Navbar";
import Footer from "@/components/main/Footer";
import ReduxProvider from "./ReduxProvider";
import { Toaster } from "react-hot-toast";

const FACEBOOK_PIXEL_ID = "1427812482199666";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Solvestic | Brightening Skincare & Hydration Essentials",
  description:
    "Discover Solvestic skincare essentials for brighter, smoother, hydrated-looking skin. Explore pigment-correcting face cleanser, bouncy moisturiser and daily skincare combos.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${inter.variable}`}
    >
      <head>
        {/* Facebook Pixel */}
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){
              n.callMethod?
              n.callMethod.apply(n,arguments):
              n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;
              n.push=n;
              n.loaded=!0;
              n.version='2.0';
              n.queue=[];
              t=b.createElement(e);
              t.async=!0;
              t.src=v;
              s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)
              }(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');

              fbq('init', '${FACEBOOK_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />

        {/* Facebook Pixel NoScript */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </head>

      <body className="min-h-screen flex flex-col">
        <ReduxProvider>
          <SmoothScroll>
            <Navbar />
            {children}
            <Footer />
            <Toaster />
          </SmoothScroll>
        </ReduxProvider>
      </body>
    </html>
  );
}
